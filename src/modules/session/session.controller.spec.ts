import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import * as sysMsg from '../../constants/system.messages';

import {
  RevokeSessionDto,
  RevokeAllSessionsDto,
} from './dto/session-revoke.dto';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;

  const mockSessionService = {
    findByUserId: jest.fn(),
    findOne: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return user sessions when found', async () => {
      const mockSessions = [
        { id: 'session1', user_id: 'user1', is_active: true },
        { id: 'session2', user_id: 'user1', is_active: true },
      ];
      const mockRequest = { user: { id: 'user1' } };

      mockSessionService.findByUserId.mockResolvedValue(mockSessions);

      const result = await controller.findByUserId(mockRequest);

      expect(service.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockSessions);
    });

    it('should return empty array when no sessions found', async () => {
      const mockRequest = { user: { id: 'user1' } };
      mockSessionService.findByUserId.mockResolvedValue([]);

      const result = await controller.findByUserId(mockRequest);

      expect(service.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return session when found', async () => {
      const mockSession = { id: 'session1', user_id: 'user1', is_active: true };
      mockSessionService.findOne.mockResolvedValue(mockSession);

      const result = await controller.findOne('session1');

      expect(service.findOne).toHaveBeenCalledWith('session1');
      expect(result).toEqual(mockSession);
    });

    it('should return null when session not found', async () => {
      mockSessionService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('non-existent-id');

      expect(service.findOne).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('revokeSession', () => {
    it('should return success response when session is revoked', async () => {
      const dto: RevokeSessionDto = { session_id: 'session1' };
      const mockRequest = { user: { userId: 'user1' } };
      const mockResponse = new ApiSuccessResponseDto(sysMsg.SESSION_REVOKED);

      mockSessionService.revokeSession.mockResolvedValue(mockResponse);

      const result = await controller.revokeSession(mockRequest, dto);

      expect(service.revokeSession).toHaveBeenCalledWith('session1', 'user1');
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException when session is not found', async () => {
      const dto: RevokeSessionDto = { session_id: 'non-existent' };
      const mockRequest = { user: { userId: 'user1' } };

      mockSessionService.revokeSession.mockRejectedValue(
        new NotFoundException(sysMsg.SESSION_NOT_FOUND),
      );

      await expect(controller.revokeSession(mockRequest, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.revokeSession).toHaveBeenCalledWith(
        'non-existent',
        'user1',
      );
    });

    it('should throw CannotRevokeOtherSessionsException when trying to revoke other user session', async () => {
      const dto: RevokeSessionDto = { session_id: 'other-user-session' };
      const mockRequest = { user: { userId: 'user1' } };

      mockSessionService.revokeSession.mockRejectedValue(
        new NotFoundException(sysMsg.CANNOT_REVOKE_OTHER_SESSIONS),
      );

      await expect(controller.revokeSession(mockRequest, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions excluding current when exclude_current is true', async () => {
      const dto: RevokeAllSessionsDto = { exclude_current: true };
      const mockRequest = {
        user: {
          userId: 'user1',
          sessionId: 'current-session',
        },
      };
      const mockResponse = {
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 2 },
      };

      mockSessionService.revokeAllUserSessions.mockResolvedValue(mockResponse);

      const result = await controller.revokeAllSessions(mockRequest, dto);

      expect(service.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        'current-session',
      );
      expect(result).toEqual(mockResponse);
    });

    it('should revoke all sessions including current when exclude_current is false', async () => {
      const dto: RevokeAllSessionsDto = { exclude_current: false };
      const mockRequest = {
        user: {
          userId: 'user1',
          sessionId: 'current-session',
        },
      };
      const mockResponse = {
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 3 },
      };

      mockSessionService.revokeAllUserSessions.mockResolvedValue(mockResponse);

      const result = await controller.revokeAllSessions(mockRequest, dto);

      expect(service.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle revoke all when no sessionId in request', async () => {
      const dto: RevokeAllSessionsDto = { exclude_current: true };
      const mockRequest = { user: { userId: 'user1' } }; // No sessionId
      const mockResponse = {
        ...new ApiSuccessResponseDto(sysMsg.SESSIONS_REVOKED),
        data: { revoked_count: 2 },
      };

      mockSessionService.revokeAllUserSessions.mockResolvedValue(mockResponse);

      const result = await controller.revokeAllSessions(mockRequest, dto);

      expect(service.revokeAllUserSessions).toHaveBeenCalledWith(
        'user1',
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
