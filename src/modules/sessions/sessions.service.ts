import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async getActiveSessions(userId: string): Promise<Session[]> {
    try {
      return await this.sessionRepo.find({
        where: {
          userId,
          isActive: true,
          expiresAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch active sessions',
      );
    }
  }
}
