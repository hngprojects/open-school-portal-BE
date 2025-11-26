import { PaginationMeta } from '@hng-sdk/orm';
import { HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { In } from 'typeorm';

import { EmailTemplateID } from '../../../constants/email-constants';
import * as sysMsg from '../../../constants/system.messages';
import { EmailService } from '../../email/email.service';
import { SchoolService } from '../../school/school.service';
import * as passwordUtil from '../../shared/utils/password.util';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { InviteUserDto, InviteRole } from '../dto/invite-user.dto';
import { Invite, InviteStatus } from '../entities/invites.entity';
import { InviteService } from '../invites.service';
import { InviteModelAction } from '../model-actions/invite-action';

describe('InviteService', () => {
  let service: InviteService;
  let inviteModelAction: jest.Mocked<InviteModelAction>;
  let userService: jest.Mocked<UserService>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;

  const mockInviteModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockSchoolService = {};

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        {
          provide: InviteModelAction,
          useValue: mockInviteModelAction,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: SchoolService,
          useValue: mockSchoolService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    inviteModelAction = module.get(InviteModelAction);
    userService = module.get(UserService);
    emailService = module.get(EmailService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendInvite', () => {
    const mockPayload: InviteUserDto = {
      email: 'test@example.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
    };

    const mockInvite = {
      id: '123',
      email: 'test@example.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
      token_hash: 'hashed-token',
      status: InviteStatus.PENDING,
      invited_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    };

    beforeEach(() => {
      configService.get.mockReturnValue('http://localhost:3000');
      jest.spyOn(passwordUtil, 'generateUniqueToken').mockResolvedValue({
        rawToken: 'raw-token-123',
        hashedToken: 'hashed-token-123',
      });
    });

    it('should return CONFLICT if user already exists', async () => {
      userService.findByEmail.mockResolvedValue({ id: '1' } as User);

      const result = await service.sendInvite(mockPayload);

      expect(result).toEqual({
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.ACCOUNT_ALREADY_EXISTS,
        data: [],
      });
      expect(userService.findByEmail).toHaveBeenCalledWith(mockPayload.email);
    });

    it('should return CONFLICT if invitation already sent', async () => {
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValueOnce(mockInvite as Invite);

      const result = await service.sendInvite(mockPayload);

      expect(result).toEqual({
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.INVITE_ALREADY_SENT,
        data: [],
      });
      expect(inviteModelAction.get).toHaveBeenCalledWith({
        identifierOptions: {
          email: mockPayload.email,
          status: In([InviteStatus.PENDING, InviteStatus.ACCEPTED]),
        },
      });
    });

    it('should throw ServiceUnavailableException if token already exists', async () => {
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValueOnce(null);
      inviteModelAction.get.mockResolvedValueOnce(mockInvite as Invite);

      await expect(service.sendInvite(mockPayload)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should successfully send invite for TEACHER role', async () => {
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValue(null); // No existing invite or token
      inviteModelAction.create.mockResolvedValue(mockInvite as Invite);
      emailService.sendMail.mockResolvedValue(undefined);

      const result = await service.sendInvite(mockPayload);

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.INVITE_SENT,
        data: null,
      });

      expect(inviteModelAction.create).toHaveBeenCalledWith({
        createPayload: {
          email: mockPayload.email,
          role: mockPayload.role,
          first_name: mockPayload.first_name,
          last_name: mockPayload.last_name,
          token_hash: 'hashed-token-123',
          status: InviteStatus.PENDING,
          invited_at: expect.any(Date),
          expires_at: expect.any(Date),
        },
        transactionOptions: { useTransaction: false },
      });

      expect(emailService.sendMail).toHaveBeenCalledWith({
        to: [
          {
            email: mockInvite.email,
            name: `${mockInvite.first_name} ${mockInvite.last_name}`,
          },
        ],
        subject: 'You are invited to join',
        templateNameID: EmailTemplateID.INVITE,
        templateData: {
          firstName: mockInvite.first_name,
          role: mockInvite.role,
          inviteLink:
            'http://localhost:3000/invited-teacher?token=raw-token-123',
        },
      });
    });

    it('should use correct route for PARENT role', async () => {
      const parentPayload = { ...mockPayload, role: InviteRole.PARENT };
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValue(null);
      inviteModelAction.create.mockResolvedValue({
        ...mockInvite,
        role: InviteRole.PARENT,
      } as Invite);
      emailService.sendMail.mockResolvedValue(undefined);

      await service.sendInvite(parentPayload);

      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateData: expect.objectContaining({
            inviteLink:
              'http://localhost:3000/invited-parent?token=raw-token-123',
          }),
        }),
      );
    });

    it('should use correct route for ADMIN role', async () => {
      const adminPayload = { ...mockPayload, role: InviteRole.ADMIN };
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValue(null);
      inviteModelAction.create.mockResolvedValue({
        ...mockInvite,
        role: InviteRole.ADMIN,
      } as Invite);
      emailService.sendMail.mockResolvedValue(undefined);

      await service.sendInvite(adminPayload);

      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateData: expect.objectContaining({
            inviteLink:
              'http://localhost:3000/invited-admin?token=raw-token-123',
          }),
        }),
      );
    });

    it('should use correct route for STUDENT role', async () => {
      const studentPayload = { ...mockPayload, role: InviteRole.STUDENT };
      userService.findByEmail.mockResolvedValue(null);
      inviteModelAction.get.mockResolvedValue(null);
      inviteModelAction.create.mockResolvedValue({
        ...mockInvite,
        role: InviteRole.STUDENT,
      } as Invite);
      emailService.sendMail.mockResolvedValue(undefined);

      await service.sendInvite(studentPayload);

      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          templateData: expect.objectContaining({
            inviteLink:
              'http://localhost:3000/invited-student?token=raw-token-123',
          }),
        }),
      );
    });
  });

  describe('getPendingInvites', () => {
    it('should return NOT_FOUND if no pending invites exist', async () => {
      inviteModelAction.list.mockResolvedValue({
        payload: [],
        count: 0,
      } as unknown as {
        payload: Invite[];
        paginationMeta: Partial<PaginationMeta>;
      });
      const result = await service.getPendingInvites();

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: sysMsg.NO_PENDING_INVITES,
        data: [],
      });
      expect(inviteModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: { status: InviteStatus.PENDING },
      });
    });

    it('should return pending invites successfully', async () => {
      const mockInvites = [
        {
          id: '1',
          email: 'test1@example.com',
          invited_at: new Date('2024-01-01'),
          status: InviteStatus.PENDING,
        },
        {
          id: '2',
          email: 'test2@example.com',
          invited_at: new Date('2024-01-02'),
          status: InviteStatus.PENDING,
        },
      ];

      inviteModelAction.list.mockResolvedValue({
        payload: mockInvites,
        count: 2,
      } as unknown as {
        payload: Invite[];
        paginationMeta: Partial<PaginationMeta>;
      });

      const result = await service.getPendingInvites();

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.PENDING_INVITES_FETCHED,
        data: mockInvites.map((invite) => ({
          id: invite.id,
          email: invite.email,
          invited_at: invite.invited_at,
          status: invite.status,
        })),
      });
    });
  });

  describe('getAcceptedInvites', () => {
    it('should return NOT_FOUND if no accepted invites exist', async () => {
      inviteModelAction.list.mockResolvedValue({
        payload: [],
        count: 0,
      } as unknown as {
        payload: Invite[];
        paginationMeta: Partial<PaginationMeta>;
      });

      const result = await service.getAcceptedInvites();

      expect(result).toEqual({
        status_code: HttpStatus.NOT_FOUND,
        message: sysMsg.NO_ACCEPTED_INVITES,
        data: [],
      });
      expect(inviteModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: { status: InviteStatus.ACCEPTED },
      });
    });

    it('should return accepted invites successfully', async () => {
      const mockInvites = [
        {
          id: '1',
          email: 'test1@example.com',
          invited_at: new Date('2024-01-01'),
          status: InviteStatus.ACCEPTED,
        },
        {
          id: '2',
          email: 'test2@example.com',
          invited_at: new Date('2024-01-02'),
          status: InviteStatus.ACCEPTED,
        },
      ];

      inviteModelAction.list.mockResolvedValue({
        payload: mockInvites,
        count: 2,
      } as any);

      const result = await service.getAcceptedInvites();

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.ACCEPTED_INVITES_FETCHED,
        data: mockInvites.map((invite) => ({
          id: invite.id,
          email: invite.email,
          invited_at: invite.invited_at,
          status: invite.status,
        })),
      });
    });
  });
});
