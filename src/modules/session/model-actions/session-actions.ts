import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Session } from '../entities/session.entity';

@Injectable()
export class SessionModelAction extends AbstractModelAction<Session> {
  constructor(
    @InjectRepository(Session)
    sessionRepository: Repository<Session>,
  ) {
    super(sessionRepository, Session);
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.repository.find({
      where: {
        user_id: userId,
        is_active: true,
        revoked_at: null,
      },
    });
  }

  async revokeAllUserSessions(
    userId: string,
    excludeSessionId?: string,
  ): Promise<{ affected?: number }> {
    const updatePayload = {
      is_active: false,
      revoked_at: new Date(),
    };

    const query = this.repository
      .createQueryBuilder()
      .update(Session)
      .set(updatePayload)
      .where('user_id = :userId', { userId })
      .andWhere('is_active = :isActive', { isActive: true });

    if (excludeSessionId) {
      query.andWhere('id != :excludeSessionId', { excludeSessionId });
    }

    const result = await query.execute();
    return { affected: result.affected };
  }
}
