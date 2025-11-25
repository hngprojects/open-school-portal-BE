import { Test, TestingModule } from '@nestjs/testing';

import { InviteRole, InviteUserDto } from '../dto/invite-user.dto';
import { PendingInvitesResponseDto } from '../dto/pending-invite.dto';
import {
  ValidateInviteDto,
  ValidateInviteResponseDto,
} from '../dto/validate-invite.dto';
import { InvitesController } from '../invites.controller';
import { InviteService } from '../invites.service';

describe('InvitesController', () => {
  let controller: InvitesController;
  let inviteService: InviteService;

  const mockInviteService = {
    sendInvite: jest.fn(),
    validateInviteToken: jest.fn(),
    getPendingInvites: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitesController],
      providers: [
        {
          provide: InviteService,
          useValue: mockInviteService,
        },
      ],
    }).compile();

    controller = module.get<InvitesController>(InvitesController);
    inviteService = module.get<InviteService>(InviteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    it('should call InviteService.sendInvite with correct payload', async () => {
      const dto: InviteUserDto = {
        email: 'user@example.com',
        full_name: 'John Doe',
        role: InviteRole.TEACHER,
      };

      const mockResponse = {
        status_code: 201,
        message: 'Invitation sent successfully',
        data: {},
      };

      mockInviteService.sendInvite.mockResolvedValue(mockResponse);

      const result = await controller.inviteUser(dto);

      expect(inviteService.sendInvite).toHaveBeenCalledTimes(1);
      expect(inviteService.sendInvite).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResponse);
    });
  });

  // ---------------------------------------------------------
  // VALIDATE INVITE TOKEN
  // ---------------------------------------------------------
  describe('validateInviteToken', () => {
    it('should validate an invite token', async () => {
      const query: ValidateInviteDto = { token: 'sampletoken123' };

      const mockResponse: ValidateInviteResponseDto = {
        valid: true,
        reason: 'Token is valid',
        message: 'Token validated successfully',
        data: {
          invite_id: 'uuid-123',
          email: 'john@example.com',
          full_name: 'John Doe',
          role: 'teacher',
          expires_at: new Date('2025-11-25T09:00:00.000Z'),
        },
      };

      mockInviteService.validateInviteToken.mockResolvedValue(mockResponse);

      const result = await controller.validateInviteToken(query);

      expect(inviteService.validateInviteToken).toHaveBeenCalledTimes(1);
      expect(inviteService.validateInviteToken).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResponse);
    });
  });

  // ---------------------------------------------------------
  // GET PENDING INVITES
  // ---------------------------------------------------------
  describe('getPendingInvites', () => {
    it('should return pending invites', async () => {
      const mockResponse: PendingInvitesResponseDto = {
        status_code: 200,
        message: 'Pending invites retrieved',
        data: [
          {
            id: '123',
            email: 'pending@example.com',
            invited_at: new Date('2025-11-18T18:53:00.000Z'),
          },
        ],
      };

      mockInviteService.getPendingInvites.mockResolvedValue(mockResponse);

      const result = await controller.getPendingInvites();

      expect(inviteService.getPendingInvites).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });
  });
});
