import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';

import { EmailTemplateID } from '../../constants/email-constants';
import { EmailService } from '../email/email.service';

import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistService } from './waitlist.service';

type MockRepository<T = unknown> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

interface IMockLogger {
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
  child: jest.Mock;
}

describe('WaitlistService', () => {
  let service: WaitlistService;
  let waitlistRepository: MockRepository<Waitlist>;
  let emailService: Partial<Record<keyof EmailService, jest.Mock>>;
  let logger: IMockLogger;

  const mockWaitlistEntry = {
    id: 'uuid-123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    createdAt: new Date(),
  } as Waitlist;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockEmailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    const mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistService,
        {
          provide: getRepositoryToken(Waitlist),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<WaitlistService>(WaitlistService);
    waitlistRepository = module.get(getRepositoryToken(Waitlist));
    emailService = module.get(EmailService);
    logger = module.get(WINSTON_MODULE_PROVIDER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateWaitlistDto = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    };

    it('should successfully add a user to the waitlist and send an email', async () => {
      waitlistRepository.findOne.mockResolvedValue(null);
      waitlistRepository.create.mockReturnValue(mockWaitlistEntry);
      waitlistRepository.save.mockResolvedValue(mockWaitlistEntry);

      const result = await service.create(createDto);

      expect(waitlistRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(waitlistRepository.save).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: [{ email: 'john@example.com', name: 'John' }],
          templateNameID: EmailTemplateID.WAITLIST_WELCOME,
        }),
      );
      expect(result).toEqual(mockWaitlistEntry);
    });

    it('should throw ConflictException if email already exists', async () => {
      waitlistRepository.findOne.mockResolvedValue(mockWaitlistEntry);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should log error if email sending fails but still return the user', async () => {
      waitlistRepository.findOne.mockResolvedValue(null);
      waitlistRepository.create.mockReturnValue(mockWaitlistEntry);
      waitlistRepository.save.mockResolvedValue(mockWaitlistEntry);

      // Simulate email failure
      const emailError = new Error('SMTP Error');
      emailService.sendMail.mockRejectedValue(emailError);

      const result = await service.create(createDto);

      // Needs a small delay for the non-awaited promise to catch
      await new Promise(process.nextTick);

      expect(result).toEqual(mockWaitlistEntry);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to queue welcome email'),
        emailError.message,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of waitlist entries', async () => {
      const resultArr = [mockWaitlistEntry];
      waitlistRepository.find.mockResolvedValue(resultArr);

      const result = await service.findAll();

      expect(result).toEqual(resultArr);
      expect(waitlistRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single entry', async () => {
      waitlistRepository.findOne.mockResolvedValue(mockWaitlistEntry);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockWaitlistEntry);
    });

    it('should throw NotFoundException if entry not found', async () => {
      waitlistRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a waitlist entry', async () => {
      waitlistRepository.findOne.mockResolvedValue(mockWaitlistEntry);
      waitlistRepository.remove.mockResolvedValue(mockWaitlistEntry);

      await service.remove('uuid-123');

      expect(waitlistRepository.remove).toHaveBeenCalledWith(mockWaitlistEntry);
    });

    it('should throw NotFoundException if trying to remove non-existent entry', async () => {
      waitlistRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
