import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import {
  SessionNotFoundException,
  CannotRevokeOtherSessionsException,
} from '../../common/exceptions/domain.exceptions';
import * as sysMsg from '../../constants/system.messages';

import { Session } from './entities/session.entity';
import { SessionModelAction } from './model-actions/session-actions';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let sessionModelAction: jest.Mocked<SessionModelAction>;
  let dataSource: DataSource;

  // Create proper mock session that matches your Session entity
  const createMockSession = (overrides: Partial<Session> = {}): Session =>
    ({
      id: 'session1',
      user_id: 'user1',
      refresh_token: 'refresh-token-hash',
      expires_at: new Date(),
      provider: 'jwt',
      is_active: true,
      revoked_at: null,
      user: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Session;

  const mockSessionModelAction = {
    create: jest.fn(),
    update: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    repository: {
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    },
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionModelAction,
          useValue: mockSessionModelAction,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionModelAction = module.get(SessionModelAction);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return session using transaction', async () => {
      const createPayload = {
        user_id: 'user1',
        refresh_token: 'refresh-token',
        expires_at: new Date(),
        provider: 'jwt',
        is_active: true,
      };

      const mockSession = createMockSession(createPayload);

      const mockTransaction = jest.fn((callback) =>
        callback({ manager: 'mock-manager' }),
      );
      mockDataSource.transaction.mockImplementation(mockTransaction);
      mockSessionModelAction.create.mockResolvedValue(mockSession);

      const result = await service.create(createPayload);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(sessionModelAction.create).toHaveBeenCalledWith({
        createPayload: { ...createPayload, is_active: true },
        transactionOptions: {
          useTransaction: true,
          transaction: { manager: 'mock-manager' },
        },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('findByUserId', () => {
    it('should return sessions for user', async () => {
      const mockSessions = [
        createMockSession({ id: 'session1', user_id: 'user1' }),
        createMockSession({ id: 'session2', user_id: 'user1' }),
      ];

      mockSessionModelAction.findByUserId.mockResolvedValue(mockSessions);

      const result = await service.findByUserId('user1');

      expect(sessionModelAction.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockSessions);
    });

    it('should return empty array when no sessions found', async () => {
      mockSessionModelAction.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId('user1');

      expect(sessionModelAction.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual([]);
    });
  });

  describe('findByRefreshToken', () => {
    it('should return session when found by refresh token', async () => {
      const mockSession = createMockSession({
        id: 'session1',
        refresh_token: 'token-hash',
      });

      // Mock repository.find to return the session

      // Assign the mock directly to the repository.find property
      (mockSessionModelAction.repository.find as jest.Mock).mockResolvedValue([
        mockSession,
      ]);

      // Mock bcrypt.compare to always return true for this test
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await service.findByRefreshToken('user1', 'token-hash');
      expect(result).toEqual(mockSession);
    });

    it('should return null when refresh token not found', async () => {
      // Mock repository.find to return an empty array

      // Assign the mock directly to the repository.find property
      (mockSessionModelAction.repository.find as jest.Mock).mockResolvedValue(
        [],
      );

      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      const result = await service.findByRefreshToken(
        'user1',
        'non-existent-token',
      );
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return session when found by id', async () => {
      const mockSession = createMockSession({ id: 'session1' });
      mockSessionModelAction.get.mockResolvedValue(mockSession);

      const result = await service.findOne('session1');

      expect(sessionModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'session1' },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('revokeSession', () => {
    it('should revoke session when found and owned by user', async () => {
      const mockSession = createMockSession({
        id: 'session1',
        user_id: 'user1',
      });

      mockSessionModelAction.get.mockResolvedValue(mockSession);
      mockSessionModelAction.update.mockResolvedValue({
        ...mockSession,
        is_active: false,
      });

      const result = await service.revokeSession('session1', 'user1');

      expect(sessionModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'session1' },
      });
      expect(sessionModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: 'session1' },
        updatePayload: {
          is_active: false,
          revoked_at: expect.any(Date),
        },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toBeInstanceOf(ApiSuccessResponseDto);
      expect(result.message).toBe(sysMsg.SESSION_REVOKED);
    });

    it('should throw SessionNotFoundException when session not found', async () => {
      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(
        service.revokeSession('non-existent', 'user1'),
      ).rejects.toThrow(SessionNotFoundException);
    });

    it('should throw SessionNotFoundException when session already inactive', async () => {
      const mockSession = createMockSession({
        id: 'session1',
        user_id: 'user1',
        is_active: false,
      });

      mockSessionModelAction.get.mockResolvedValue(mockSession);

      await expect(service.revokeSession('session1', 'user1')).rejects.toThrow(
        SessionNotFoundException,
      );
    });

    it('should throw CannotRevokeOtherSessionsException when session owned by different user', async () => {
      const mockSession = createMockSession({
        id: 'session1',
        user_id: 'user2',
      });

      mockSessionModelAction.get.mockResolvedValue(mockSession);

      await expect(service.revokeSession('session1', 'user1')).rejects.toThrow(
        CannotRevokeOtherSessionsException,
      );
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should revoke all user sessions and return count', async () => {
      const mockResult = { affected: 3 };
      mockSessionModelAction.revokeAllUserSessions.mockResolvedValue(
        mockResult,
      );

      const result = await service.revokeAllUserSessions('user1');

      expect(sessionModelAction.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        undefined,
      );
      expect(result).toEqual({
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 3 },
      });
    });

    it('should revoke all sessions except excluded one', async () => {
      const mockResult = { affected: 2 };
      mockSessionModelAction.revokeAllUserSessions.mockResolvedValue(
        mockResult,
      );

      const result = await service.revokeAllUserSessions(
        'user1',
        'exclude-session',
      );

      expect(sessionModelAction.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        'exclude-session',
      );
      expect(result).toEqual({
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 2 },
      });
    });

    it('should handle zero sessions revoked', async () => {
      const mockResult = { affected: 0 };
      mockSessionModelAction.revokeAllUserSessions.mockResolvedValue(
        mockResult,
      );

      const result = await service.revokeAllUserSessions('user1');

      expect(sessionModelAction.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        undefined,
      );
      expect(result).toEqual({
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 0 },
      });
    });
  });

  describe('remove', () => {
    it('should delete session when found', async () => {
      const mockSession = createMockSession({ id: 'session1' });
      mockSessionModelAction.get.mockResolvedValue(mockSession);
      mockSessionModelAction.delete.mockResolvedValue(undefined);

      const result = await service.remove('session1');

      expect(sessionModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'session1' },
      });
      expect(sessionModelAction.delete).toHaveBeenCalledWith({
        identifierOptions: { id: 'session1' },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toBeInstanceOf(ApiSuccessResponseDto);
      expect(result.message).toBe(sysMsg.SESSION_REVOKED);
    });

    it('should throw SessionNotFoundException when session not found for deletion', async () => {
      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        SessionNotFoundException,
      );
    });
  });

  describe('updateSession', () => {
    it('should update session with provided payload', async () => {
      const updatePayload = { is_active: false };
      const identifierOptions = { id: 'session1' };
      const mockEntityManager = {} as EntityManager;
      const transactionOptions = {
        useTransaction: true as const,
        transaction: mockEntityManager,
      };

      const mockUpdatedSession = createMockSession({
        id: 'session1',
        is_active: false,
      });

      mockSessionModelAction.update.mockResolvedValue(mockUpdatedSession);

      const result = await service.updateSession(
        updatePayload,
        identifierOptions,
        transactionOptions,
      );

      expect(sessionModelAction.update).toHaveBeenCalledWith({
        updatePayload,
        identifierOptions,
        transactionOptions,
      });
      expect(result).toEqual(mockUpdatedSession);
    });
  });
});
