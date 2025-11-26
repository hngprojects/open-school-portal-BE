import * as crypto from 'crypto';

import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmailService } from '../../email/email.service';
import { User } from '../../user/entities/user.entity';
import { InviteUserDto, InviteRole } from '../dto/invite-user.dto';
import { ValidateInviteDto } from '../dto/validate-invite.dto';
import { Invite, InviteStatus } from '../entities/invites.entity';
import { InviteService } from '../invites.service';

describe('InviteService', () => {
  let service: InviteService;

  const mockInviteRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  const mockInvite: Partial<Invite> = {
    id: '1',
    email: 'test@example.com',
    role: InviteRole.TEACHER,
    first_name: 'John',
    last_name: 'Doe',
    token_hash: 'hashed_token',
    status: InviteStatus.PENDING,
    invited_at: new Date(),
    expires_at: new Date(Date.now() + 30 * 60 * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getRepositoryToken(Invite), useValue: mockInviteRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);

    jest.clearAllMocks();
  });

  describe('sendInvite', () => {
    const invitePayload: InviteUserDto = {
      email: 'test@example.com',
      role: InviteRole.TEACHER,
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should return conflict if user already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: '1',
        email: invitePayload.email,
      });

      const result = await service.sendInvite(invitePayload);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('Account already exists');
    });

    it('should return conflict if invite already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.findOne.mockResolvedValue(mockInvite);

      const result = await service.sendInvite(invitePayload);

      expect(result.status_code).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe('Invite already sent');
    });

    it('should send invite successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.create.mockReturnValue(mockInvite);
      mockInviteRepo.save.mockResolvedValue(mockInvite);
      mockEmailService.sendMail.mockResolvedValue(true);

      const mockToken = { rawToken: 'raw_token', hashedToken: 'hashed_token' };
      jest.spyOn(service, 'generateUniqueToken').mockResolvedValue(mockToken);

      const result = await service.sendInvite(invitePayload);

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe('Invite sent successfully');
    });

    it('should handle email send failure', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.findOne.mockResolvedValue(null);
      mockInviteRepo.create.mockReturnValue(mockInvite);
      mockInviteRepo.save.mockResolvedValue(mockInvite);

      mockEmailService.sendMail.mockRejectedValue(new Error('Email failed'));

      const mockToken = { rawToken: 'raw', hashedToken: 'hashed' };
      jest.spyOn(service, 'generateUniqueToken').mockResolvedValue(mockToken);

      const result = await service.sendInvite(invitePayload);

      expect(result.status_code).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('Email delivery failed');
    });
  });

  describe('validateInviteToken', () => {
    const validToken = 'valid_token';
    const validateDto: ValidateInviteDto = { token: validToken };

    it('should return invalid if token not found', async () => {
      mockInviteRepo.findOne.mockResolvedValue(null);

      const result = await service.validateInviteToken(validateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid token');
    });

    it('should return invalid if token already used', async () => {
      mockInviteRepo.findOne.mockResolvedValue({
        ...mockInvite,
        status: InviteStatus.USED,
      });

      const result = await service.validateInviteToken(validateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Token already used');
    });

    it('should return invalid for expired token', async () => {
      const expiredInvite = {
        ...mockInvite,
        status: InviteStatus.PENDING,
        expires_at: new Date(Date.now() - 1000),
      };
      mockInviteRepo.findOne.mockResolvedValue(expiredInvite);

      const result = await service.validateInviteToken(validateDto);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Token expired');
    });

    it('should return valid token', async () => {
      const validInvite = {
        ...mockInvite,
        status: InviteStatus.PENDING,
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
      };

      mockInviteRepo.findOne.mockResolvedValue(validInvite);

      const result = await service.validateInviteToken(validateDto);

      expect(result.valid).toBe(true);
      expect(result.reason).toBe('Valid token');
    });
  });

  describe('getPendingInvites', () => {
    it('should return empty pending invites', async () => {
      mockInviteRepo.find.mockResolvedValue([]);

      const result = await service.getPendingInvites();

      expect(result.status_code).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('No pending invites found');
    });

    it('should return pending invites', async () => {
      mockInviteRepo.find.mockResolvedValue([mockInvite]);

      const result = await service.getPendingInvites();

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe('Pending invites retrieved successfully');
      expect(result.data.length).toBe(1);
    });
  });

  describe('generateUniqueToken', () => {
    it('should generate unique token', async () => {
      const mockToken = {
        rawToken: 'a'.repeat(64),
        hashedToken: 'hashed_unique_token',
      };

      jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementation(() => Buffer.from(mockToken.rawToken, 'hex'));

      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockToken.hashedToken),
      } as unknown as crypto.Hash);

      mockInviteRepo.findOne.mockResolvedValue(null);

      const result = await service.generateUniqueToken();

      expect(result).toEqual(mockToken);
    });

    it('should throw after max retries', async () => {
      const mockToken = {
        rawToken: 'b'.repeat(64),
        hashedToken: 'hashed_collision',
      };

      jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementation(() => Buffer.from(mockToken.rawToken, 'hex'));

      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockToken.hashedToken),
      } as unknown as crypto.Hash);

      mockInviteRepo.findOne.mockResolvedValue(mockInvite);

      await expect(service.generateUniqueToken()).rejects.toThrow(
        'Token generation collision',
      );
    });
  });
});
