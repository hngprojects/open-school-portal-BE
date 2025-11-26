import { createHash } from 'crypto';

import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as sysMsg from '../../../constants/system.messages';
import { EmailService } from '../../email/email.service';
import { School } from '../../school/entities/school.entity';
import { User } from '../../user/entities/user.entity';
import { InviteUserDto, InviteRole } from '../dto/invite-user.dto';
import { ValidateInviteDto } from '../dto/validate-invite.dto';
import { Invite, InviteStatus } from '../entities/invites.entity';
import { InviteService } from '../invites.service';

describe('InviteService', () => {
  let service: InviteService;
  let emailService: EmailService;

  const mockInviteRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockSchoolRepo = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const mockEmailService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getRepositoryToken(Invite), useValue: mockInviteRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(School), useValue: mockSchoolRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);

    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendInvite', () => {
    const payload: InviteUserDto = {
      email: 'test@test.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should return CONFLICT if user already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'user-id' }); // User found

      const result = await service.sendInvite(payload);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe(sysMsg.ACCOUNT_ALREADY_EXISTS);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
      });
    });

    it('should return CONFLICT if invitation already sent (PENDING or USED)', async () => {
      mockUserRepo.findOne.mockResolvedValue(null); // User not found
      mockInviteRepo.findOne.mockResolvedValue({ id: 'invite-id' }); // Invite found

      const result = await service.sendInvite(payload);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe(sysMsg.INVITE_ALREADY_SENT);
    });

    it('should return BAD_REQUEST if no school is found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.findOne.mockResolvedValue(null);
      mockSchoolRepo.findOne.mockResolvedValue(null); // No school found

      const result = await service.sendInvite(payload);

      expect(result.status_code).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe('No school found');
    });

    it('should create invite and send email successfully', async () => {
      const mockSchool = {
        id: 'school-id',
        name: 'Test School',
        logo_url: 'logo.png',
        email: 'school@test.com',
      };
      const mockInvite = {
        id: 'invite-id',
        email: payload.email,
        role: payload.role,
        token_hash: 'hashed',
        status: InviteStatus.PENDING,
        invited_at: new Date(),
        first_name: 'John',
        last_name: 'Doe',
      };

      mockUserRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.findOne.mockResolvedValue(null);
      mockSchoolRepo.findOne.mockResolvedValue(mockSchool);

      // Mock create to return the object, mock save to resolve
      mockInviteRepo.create.mockReturnValue(mockInvite);
      mockInviteRepo.save.mockResolvedValue(mockInvite);

      const result = await service.sendInvite(payload);

      expect(mockInviteRepo.create).toHaveBeenCalled();
      expect(mockInviteRepo.save).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalled();
      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(sysMsg.INVITE_SENT);
    });
  });

  describe('validateInviteToken', () => {
    const rawToken = 'test-token';
    const dto: ValidateInviteDto = { token: rawToken };
    // Replicate hashing logic from service to match mock lookup
    const hashToken = createHash('sha256').update(rawToken).digest('hex');

    it('should return invalid if token does not exist', async () => {
      mockInviteRepo.findOne.mockResolvedValue(null);

      const result = await service.validateInviteToken(dto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe(sysMsg.INVALID_TOKEN);
      expect(mockInviteRepo.findOne).toHaveBeenCalledWith({
        where: { token_hash: hashToken },
      });
    });

    it('should return invalid if token status is USED', async () => {
      mockInviteRepo.findOne.mockResolvedValue({ status: InviteStatus.USED });

      const result = await service.validateInviteToken(dto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe(sysMsg.TOKEN_ALREADY_USED);
    });

    it('should return invalid and update DB if token is EXPIRED', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1); // 1 hour ago

      mockInviteRepo.findOne.mockResolvedValue({
        id: 'invite-id',
        status: InviteStatus.PENDING,
        expires_at: expiredDate,
      });

      const result = await service.validateInviteToken(dto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe(sysMsg.TOKEN_EXPIRED);
      expect(mockInviteRepo.update).toHaveBeenCalledWith('invite-id', {
        status: InviteStatus.EXPIRED,
      });
    });

    it('should return valid data if token is valid', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1); // 1 hour future

      const validInvite = {
        id: 'invite-id',
        email: 'test@test.com',
        role: InviteRole.TEACHER,
        status: InviteStatus.PENDING,
        expires_at: futureDate,
        first_name: 'John',
        last_name: 'Doe',
      };

      mockInviteRepo.findOne.mockResolvedValue(validInvite);

      const result = await service.validateInviteToken(dto);

      expect(result.valid).toBe(true);
      expect(result.reason).toBe(sysMsg.VALID_TOKEN);
      expect(result.data.email).toBe(validInvite.email);
    });
  });

  describe('getPendingInvites', () => {
    it('should return NOT_FOUND if no pending invites', async () => {
      mockInviteRepo.find.mockResolvedValue([]);

      const result = await service.getPendingInvites();

      expect(result.status_code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(sysMsg.NO_PENDING_INVITES);
      expect(result.data).toHaveLength(0);
    });

    it('should return list of pending invites', async () => {
      const invites = [
        {
          id: '1',
          email: 'a@a.com',
          invited_at: new Date(),
          status: InviteStatus.PENDING,
        },
        {
          id: '2',
          email: 'b@b.com',
          invited_at: new Date(),
          status: InviteStatus.PENDING,
        },
      ];
      mockInviteRepo.find.mockResolvedValue(invites);

      const result = await service.getPendingInvites();

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(sysMsg.PENDING_INVITES_FETCHED);
      expect(result.data).toHaveLength(2);
    });
  });
});
