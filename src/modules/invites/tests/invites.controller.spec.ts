import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { InviteUserDto, InviteRole } from '../dto/invite-user.dto';
import { PendingInvitesResponseDto } from '../dto/pending-invite.dto';
import {
  ValidateInviteDto,
  ValidateInviteResponseDto,
} from '../dto/validate-invite.dto';
import { InvitesController } from '../invites.controller';
import { InviteService } from '../invites.service';

// Mock the InviteService
const mockInviteService = {
  sendInvite: jest.fn(),
  validateInviteToken: jest.fn(),
  getPendingInvites: jest.fn(),
};

// Mock RolesGuard
const mockRolesGuard = {
  canActivate: jest.fn(),
};

describe('InvitesController', () => {
  let controller: InvitesController;
  let inviteService: InviteService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [
        {
          provide: InviteService,
          useValue: mockInviteService,
        },
        Reflector,
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<InvitesController>(InvitesController);
    inviteService = module.get<InviteService>(InviteService);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    const mockInviteUserDto: InviteUserDto = {
      email: 'teacher@example.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
    };

    const mockSuccessResponse = {
      status_code: HttpStatus.OK,
      message: 'INVITE_SENT',
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'teacher@example.com',
          invited_at: new Date(),
          role: InviteRole.TEACHER,
          first_name: 'John',
          last_name: 'Doe',
          status: 'pending',
        },
      ],
    };

    it('should call inviteService.sendInvite with correct payload', async () => {
      mockInviteService.sendInvite.mockResolvedValue(mockSuccessResponse);

      const result = await controller.inviteUser(mockInviteUserDto);

      expect(inviteService.sendInvite).toHaveBeenCalledWith(mockInviteUserDto);
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should return conflict when user already exists', async () => {
      const conflictResponse = {
        status_code: HttpStatus.CONFLICT,
        message: 'ACCOUNT_ALREADY_EXISTS',
        data: [],
      };
      mockInviteService.sendInvite.mockResolvedValue(conflictResponse);

      const result = await controller.inviteUser(mockInviteUserDto);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('ACCOUNT_ALREADY_EXISTS');
    });

    it('should return conflict when invite already sent', async () => {
      const conflictResponse = {
        status_code: HttpStatus.CONFLICT,
        message: 'INVITE_ALREADY_SENT',
        data: [],
      };
      mockInviteService.sendInvite.mockResolvedValue(conflictResponse);

      const result = await controller.inviteUser(mockInviteUserDto);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('INVITE_ALREADY_SENT');
    });

    it('should handle email delivery failure', async () => {
      const errorResponse = {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'EMAIL_DELIVERY_FAILED',
        data: [],
      };
      mockInviteService.sendInvite.mockResolvedValue(errorResponse);

      const result = await controller.inviteUser(mockInviteUserDto);

      expect(result.status_code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('EMAIL_DELIVERY_FAILED');
    });

    it('should have correct decorators and metadata', () => {
      // Test method decorators
      const method = Object.getOwnPropertyDescriptor(
        InvitesController.prototype,
        'inviteUser',
      );
      expect(method).toBeDefined();

      // Test controller decorators
      const controllerMetadata = Reflect.getMetadata(
        'controller',
        InvitesController,
      );
      expect(controllerMetadata).toBeDefined();
    });
  });

  describe('validateInviteToken', () => {
    const mockValidateDto: ValidateInviteDto = {
      token: 'valid-token-1234567890',
    };

    const mockValidResponse: ValidateInviteResponseDto = {
      valid: true,
      reason: 'VALID_TOKEN',
      message: 'Token validated successfully',
      data: {
        invite_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'teacher@example.com',
        role: 'TEACHER',
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        full_name: 'John Doe',
      },
    };

    const mockInvalidResponse: ValidateInviteResponseDto = {
      valid: false,
      reason: 'INVALID_TOKEN',
      message: 'Invalid token message',
    };

    it('should call inviteService.validateInviteToken with correct token', async () => {
      mockInviteService.validateInviteToken.mockResolvedValue(
        mockValidResponse,
      );

      const result = await controller.validateInviteToken(mockValidateDto);

      expect(inviteService.validateInviteToken).toHaveBeenCalledWith(
        mockValidateDto,
      );
      expect(result).toEqual(mockValidResponse);
    });

    it('should return invalid token response', async () => {
      mockInviteService.validateInviteToken.mockResolvedValue(
        mockInvalidResponse,
      );

      const result = await controller.validateInviteToken(mockValidateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('INVALID_TOKEN');
    });

    it('should return expired token response', async () => {
      const expiredResponse: ValidateInviteResponseDto = {
        valid: false,
        reason: 'TOKEN_EXPIRED',
        message: 'Token expired message',
      };
      mockInviteService.validateInviteToken.mockResolvedValue(expiredResponse);

      const result = await controller.validateInviteToken(mockValidateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('TOKEN_EXPIRED');
    });

    it('should return used token response', async () => {
      const usedResponse: ValidateInviteResponseDto = {
        valid: false,
        reason: 'TOKEN_ALREADY_USED',
        message: 'Token already used message',
      };
      mockInviteService.validateInviteToken.mockResolvedValue(usedResponse);

      const result = await controller.validateInviteToken(mockValidateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('TOKEN_ALREADY_USED');
    });

    it('should have correct decorators and metadata', () => {
      // Test method decorators
      const method = Object.getOwnPropertyDescriptor(
        InvitesController.prototype,
        'validateInviteToken',
      );
      expect(method).toBeDefined();
    });
  });

  describe('getPendingInvites', () => {
    const mockPendingInvitesResponse: PendingInvitesResponseDto = {
      status_code: HttpStatus.OK,
      message: 'PENDING_INVITES_FETCHED',
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'teacher1@example.com',
          invited_at: new Date('2023-01-01'),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'teacher2@example.com',
          invited_at: new Date('2023-01-02'),
        },
      ],
    };

    const mockEmptyResponse: PendingInvitesResponseDto = {
      status_code: HttpStatus.NOT_FOUND,
      message: 'NO_PENDING_INVITES',
      data: [],
    };

    it('should call inviteService.getPendingInvites and return results', async () => {
      mockInviteService.getPendingInvites.mockResolvedValue(
        mockPendingInvitesResponse,
      );

      const result = await controller.getPendingInvites();

      expect(inviteService.getPendingInvites).toHaveBeenCalled();
      expect(result).toEqual(mockPendingInvitesResponse);
      expect(result.data).toHaveLength(2);
    });

    it('should return empty array when no pending invites', async () => {
      mockInviteService.getPendingInvites.mockResolvedValue(mockEmptyResponse);

      const result = await controller.getPendingInvites();

      expect(result.status_code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('NO_PENDING_INVITES');
      expect(result.data).toEqual([]);
    });

    it('should have correct decorators and metadata', () => {
      // Test method decorators
      const method = Object.getOwnPropertyDescriptor(
        InvitesController.prototype,
        'getPendingInvites',
      );
      expect(method).toBeDefined();
    });
  });

  describe('Controller Metadata and Decorators', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have correct route prefix', () => {
      const controllerPath = Reflect.getMetadata('path', InvitesController);
      expect(controllerPath).toBe('invitations');
    });

    it('should have correct method routes', () => {
      const inviteUserPath = Reflect.getMetadata(
        'path',
        InvitesController.prototype.inviteUser,
      );
      const validateInvitePath = Reflect.getMetadata(
        'path',
        InvitesController.prototype.validateInviteToken,
      );
      const getPendingInvitesPath = Reflect.getMetadata(
        'path',
        InvitesController.prototype.getPendingInvites,
      );

      expect(inviteUserPath).toBe('send');
      expect(validateInvitePath).toBe('validate');
      expect(getPendingInvitesPath).toBeUndefined(); // Default route for GET
    });

    it('should have correct HTTP methods', () => {
      const inviteUserMethod = Reflect.getMetadata(
        'method',
        InvitesController.prototype.inviteUser,
      );
      const validateInviteMethod = Reflect.getMetadata(
        'method',
        InvitesController.prototype.validateInviteToken,
      );
      const getPendingInvitesMethod = Reflect.getMetadata(
        'method',
        InvitesController.prototype.getPendingInvites,
      );

      expect(inviteUserMethod).toBe(2); // POST
      expect(validateInviteMethod).toBe(0); // GET
      expect(getPendingInvitesMethod).toBe(0); // GET
    });

    it('should have correct HTTP status codes', () => {
      const inviteUserStatusCode = Reflect.getMetadata(
        '__httpCode__',
        InvitesController.prototype.inviteUser,
      );
      const validateInviteStatusCode = Reflect.getMetadata(
        '__httpCode__',
        InvitesController.prototype.validateInviteToken,
      );
      const getPendingInvitesStatusCode = Reflect.getMetadata(
        '__httpCode__',
        InvitesController.prototype.getPendingInvites,
      );

      expect(inviteUserStatusCode).toBe(HttpStatus.CREATED);
      expect(validateInviteStatusCode).toBe(HttpStatus.OK);
      expect(getPendingInvitesStatusCode).toBe(HttpStatus.OK);
    });

    it('should have role guards on protected routes', () => {
      // Test that RolesGuard is applied to inviteUser and getPendingInvites
      const inviteUserGuards = Reflect.getMetadata(
        '__guards__',
        InvitesController.prototype.inviteUser,
      );
      const getPendingInvitesGuards = Reflect.getMetadata(
        '__guards__',
        InvitesController.prototype.getPendingInvites,
      );
      const validateInviteGuards = Reflect.getMetadata(
        '__guards__',
        InvitesController.prototype.validateInviteToken,
      );

      expect(inviteUserGuards).toBeDefined();
      expect(getPendingInvitesGuards).toBeDefined();
      expect(validateInviteGuards).toBeUndefined(); // This route should not have guards
    });

    it('should have correct role decorators', () => {
      const inviteUserRoles = reflector.get(
        'roles',
        InvitesController.prototype.inviteUser,
      );
      const getPendingInvitesRoles = reflector.get(
        'roles',
        InvitesController.prototype.getPendingInvites,
      );
      const validateInviteRoles = reflector.get(
        'roles',
        InvitesController.prototype.validateInviteToken,
      );

      expect(inviteUserRoles).toEqual([UserRole.ADMIN]);
      expect(getPendingInvitesRoles).toEqual([UserRole.ADMIN]);
      expect(validateInviteRoles).toBeUndefined(); // No role restriction for token validation
    });
  });

  describe('Error Handling', () => {
    const mockInviteUserDto: InviteUserDto = {
      email: 'teacher@example.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should handle service errors in inviteUser', async () => {
      const error = new Error('Service error');
      mockInviteService.sendInvite.mockRejectedValue(error);

      await expect(controller.inviteUser(mockInviteUserDto)).rejects.toThrow(
        'Service error',
      );
    });

    it('should handle service errors in validateInviteToken', async () => {
      const mockValidateDto: ValidateInviteDto = { token: 'test-token' };
      const error = new Error('Validation error');
      mockInviteService.validateInviteToken.mockRejectedValue(error);

      await expect(
        controller.validateInviteToken(mockValidateDto),
      ).rejects.toThrow('Validation error');
    });

    it('should handle service errors in getPendingInvites', async () => {
      const error = new Error('Database error');
      mockInviteService.getPendingInvites.mockRejectedValue(error);

      await expect(controller.getPendingInvites()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('DTO Validation', () => {
    it('should accept valid InviteUserDto', async () => {
      const validDto: InviteUserDto = {
        email: 'valid@example.com',
        role: InviteRole.TEACHER,
        first_name: 'Jane',
        last_name: 'Smith',
      };

      mockInviteService.sendInvite.mockResolvedValue({
        status_code: HttpStatus.OK,
        message: 'INVITE_SENT',
        data: [],
      });

      const result = await controller.inviteUser(validDto);

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(inviteService.sendInvite).toHaveBeenCalledWith(validDto);
    });

    it('should accept valid ValidateInviteDto', async () => {
      const validDto: ValidateInviteDto = {
        token: 'a'.repeat(32), // Valid length
      };

      mockInviteService.validateInviteToken.mockResolvedValue({
        valid: true,
        reason: 'VALID_TOKEN',
        message: 'Valid token',
      });

      const result = await controller.validateInviteToken(validDto);

      expect(result.valid).toBe(true);
      expect(inviteService.validateInviteToken).toHaveBeenCalledWith(validDto);
    });
  });
});
