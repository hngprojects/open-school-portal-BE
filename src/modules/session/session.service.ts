import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import {
  SessionNotFoundException,
  CannotRevokeOtherSessionsException,
} from '../../common/exceptions/domain.exceptions';
import * as sysMsg from '../../constants/system.messages';

import { CreateSessionDto } from './dto/create-session.dto';
import { Session } from './entities/session.entity';
import { SessionModelAction } from './model-actions/session-actions';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionModelAction: SessionModelAction,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPayload: CreateSessionDto): Promise<Session> {
    return this.dataSource.transaction(async (manager) => {
      const newSession = await this.sessionModelAction.create({
        createPayload: {
          ...createPayload,
          is_active: true,
        },
        transactionOptions: { useTransaction: true, transaction: manager },
      });
      return newSession;
    });
  }

  async updateSession(
    payload: Parameters<
      typeof this.sessionModelAction.update
    >[0]['updatePayload'],
    identifierOptions: Parameters<
      typeof this.sessionModelAction.update
    >[0]['identifierOptions'],
    options?: Parameters<
      typeof this.sessionModelAction.update
    >[0]['transactionOptions'],
  ) {
    return this.sessionModelAction.update({
      updatePayload: payload,
      identifierOptions,
      transactionOptions: options,
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.sessionModelAction.findByUserId(userId);
  }

  async findByRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<Session | null> {
    // Find all active sessions for the user
    const repository = this.sessionModelAction['repository'];
    const sessions = await repository.find({
      where: { user_id: userId, is_active: true, revoked_at: null },
    });

    // Compare each session's refresh_token hash with the incoming token
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refresh_token);
      if (isMatch) {
        return session;
      }
    }
    return null;
  }

  async findOne(id: string): Promise<Session | null> {
    return this.sessionModelAction.get({
      identifierOptions: { id },
    });
  }

  findAll() {
    return `This action returns all session`;
  }

  update(id: number) {
    return `This action updates a #${id} session`;
  }

  async revokeSession(sessionId: string, currentUserId: string) {
    const session = await this.sessionModelAction.get({
      identifierOptions: { id: sessionId },
    });

    if (!session || !session.is_active) {
      throw new SessionNotFoundException(sessionId);
    }

    if (session.user_id !== currentUserId) {
      throw new CannotRevokeOtherSessionsException(
        sysMsg.CANNOT_REVOKE_OTHER_SESSIONS,
      );
    }

    await this.sessionModelAction.update({
      identifierOptions: { id: sessionId },
      updatePayload: {
        is_active: false,
        revoked_at: new Date(),
      },
      transactionOptions: { useTransaction: false },
    });

    return new ApiSuccessResponseDto(sysMsg.SESSION_REVOKED);
  }

  async revokeAllUserSessions(userId: string, excludeSessionId?: string) {
    const result = await this.sessionModelAction.revokeAllUserSessions(
      userId,
      excludeSessionId,
    );

    return {
      ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
      data: { revoked_count: result.affected || 0 },
    };
  }

  async remove(id: string) {
    const session = await this.sessionModelAction.get({
      identifierOptions: { id },
    });

    if (!session) {
      throw new SessionNotFoundException(id);
    }

    await this.sessionModelAction.delete({
      identifierOptions: { id },
      transactionOptions: { useTransaction: false },
    });

    return new ApiSuccessResponseDto(sysMsg.SESSION_REVOKED);
  }
}
