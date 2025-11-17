import { Test } from '@nestjs/testing';
import { SessionsService } from '../src/modules/auth/sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from '../src/modules//auth/entities/session.entity';
import { Repository } from 'typeorm';

describe('SessionsService', () => {
  let service: SessionsService;
  let repo: Repository<Session>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get(SessionsService);
    repo = module.get(getRepositoryToken(Session));
  });

  it('should return only active sessions', async () => {
    const now = new Date();

    const activeSession: Partial<Session> = {
      id: 'session-1',
      refreshToken: 'mock-refresh-token',
      userAgent: 'Mozilla/5.0',
      userId: '123',
      isActive: true,
      expiresAt: new Date(now.getTime() + 10_000), // active
      createdAt: now,
    };

    // Mock the repository call
    jest.spyOn(repo, 'find').mockResolvedValue([activeSession] as Session[]);

    const sessions = await service.getActiveSessions('123');

    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe('session-1');
    expect(sessions[0].isActive).toBe(true);
  });
});
