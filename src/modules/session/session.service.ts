import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CannotRevokeOtherSessionsException } from '../../common/exceptions/domain.exceptions';
import * as SYS_MSG from '../../constants/system.messages';

import { Session } from './entities/session.entity';
import {
  RevokeSessionData,
  CreateSessionData,
  RevokeAllSessionsData,
} from './interface/session-response.interface';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  private async hash_refresh_token(refresh_token: string): Promise<string> {
    const salt_rounds = 10;
    return bcrypt.hash(refresh_token, salt_rounds);
  }

  async create_session(
    user_id: string,
    refresh_token: string,
  ): Promise<CreateSessionData> {
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refresh_token_hash = await this.hash_refresh_token(refresh_token);

    const session = this.sessionRepository.create({
      user_id,
      refresh_token: refresh_token_hash,
      expires_at,
      provider: 'jwt',
      is_active: true,
    });

    const saved_session = await this.sessionRepository.save(session);

    return {
      session_id: saved_session.id,
      expires_at: saved_session.expires_at,
    };
  }

  async revoke_session(
    session_id: string,
    current_user_id: string,
  ): Promise<RevokeSessionData> {
    const session = await this.sessionRepository.findOne({
      where: { id: session_id },
      relations: ['user'],
    });

    if (!session) {
      return { revoked: false, session_id };
    }

    if (session.user_id !== current_user_id) {
      throw new CannotRevokeOtherSessionsException(
        SYS_MSG.CANNOT_REVOKE_OTHER_SESSIONS,
      );
    }

    const result = await this.sessionRepository.update(
      { id: session_id, is_active: true },
      {
        is_active: false,
        revoked_at: new Date(),
      },
    );

    return {
      revoked: result.affected > 0,
      session_id,
    };
  }

  async revoke_all_user_sessions(
    user_id: string,
    exclude_session_id?: string,
  ): Promise<RevokeAllSessionsData> {
    const query = this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({
        is_active: false,
        revoked_at: new Date(),
      })
      .where('user_id = :user_id', { user_id })
      .andWhere('is_active = :is_active', { is_active: true });

    if (exclude_session_id) {
      query.andWhere('id != :exclude_session_id', { exclude_session_id });
    }

    const result = await query.execute();

    return {
      revoked_count: result.affected || 0,
    };
  }
}
