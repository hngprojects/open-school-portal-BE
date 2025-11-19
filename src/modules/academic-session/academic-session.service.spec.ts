import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../constants/system.messages';

import { AcademicSessionService } from './academic-session.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import {
  AcademicSession,
  SessionStatus,
} from './entities/academic-session.entity';
import { AcademicSessionModelAction } from './model-actions/academic-session-actions';

describe('AcademicSessionService', () => {
  let service: AcademicSessionService;
  let mockSessionModelAction: jest.Mocked<AcademicSessionModelAction>;

  beforeEach(async () => {
    // FIX: Use Partial<T> to define the required methods and the two-step assertion
    // to safely mock the complex inherited TypeORM Model Action class without 'as any'.
    const mockModelActionProvider: Partial<AcademicSessionModelAction> = {
      get: jest.fn(),
      create: jest.fn(),
      // Only mock 'get' and 'create' as they are the only methods used in the service's 'create' function.
    };

    mockSessionModelAction =
      mockModelActionProvider as unknown as jest.Mocked<AcademicSessionModelAction>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicSessionService,
        {
          provide: AcademicSessionModelAction,
          useValue: mockSessionModelAction,
        },
      ],
    }).compile();

    service = module.get<AcademicSessionService>(AcademicSessionService);
  });

  describe('create', () => {
    it('should create a new academic session successfully', async () => {
      const createDto: CreateAcademicSessionDto = {
        name: '2024/2025',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      };

      const mockSession: AcademicSession = {
        id: '1',
        name: createDto.name,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        status: SessionStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSessionModelAction.get.mockResolvedValue(null);
      mockSessionModelAction.create.mockResolvedValue(mockSession);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSession);
      expect(mockSessionModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { name: createDto.name },
      });
      expect(mockSessionModelAction.create).toHaveBeenCalledWith({
        createPayload: {
          name: createDto.name,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        },
        transactionOptions: { useTransaction: false },
      });
    });

    it('should throw ConflictException if session name already exists', async () => {
      const createDto: CreateAcademicSessionDto = {
        name: '2024/2025',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };

      // Cast needed to satisfy TS type check for existing record
      mockSessionModelAction.get.mockResolvedValue({} as AcademicSession);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException(sysMsg.DUPLICATE_SESSION_NAME),
      );
      expect(mockSessionModelAction.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date is in the past', async () => {
      const createDto: CreateAcademicSessionDto = {
        name: '2024/2025',
        startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(sysMsg.START_DATE_IN_PAST),
      );
    });

    it('should throw BadRequestException if end date is in the past', async () => {
      const createDto: CreateAcademicSessionDto = {
        name: '2024/2025',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(sysMsg.END_DATE_IN_PAST),
      );
    });

    it('should throw BadRequestException if end date is before or equal to start date', async () => {
      const startDate = new Date(Date.now() + 86400000);
      const createDto: CreateAcademicSessionDto = {
        name: '2024/2025',
        startDate: startDate.toISOString(),
        endDate: startDate.toISOString(), // Same as start date
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(sysMsg.INVALID_DATE_RANGE),
      );
    });
  });

  describe('findAll', () => {
    it('should return all academic sessions message', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all academicSession');
    });
  });

  describe('findOne', () => {
    it('should return a single academic session message', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 academicSession');
    });
  });

  describe('update', () => {
    it('should return update message', () => {
      const result = service.update(1);
      expect(result).toBe('This action updates a #1 academicSession');
    });
  });

  describe('remove', () => {
    it('should return remove message', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 academicSession');
    });
  });
});
