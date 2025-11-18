import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository, MoreThan } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async getActiveSessions(userId: string) {
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
      // Optional: Add logging
      console.error('Error retrieving active sessions:', error);

      // Throw a NestJS-friendly error
      throw new InternalServerErrorException(
        'Failed to retrieve active sessions',
      );
    }
  }
}
