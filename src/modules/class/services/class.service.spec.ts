import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

import { AcademicSessionModelAction } from '../../academic-session/model-actions/academic-session-actions';
import { CreateClassDto } from '../dto/create-class.dto';
import { ClassTeacher } from '../entities/class-teacher.entity';
import { Class, ClassLevel } from '../entities/class.entity';
import { ClassTeacherModelAction } from '../model-actions/class-teacher.action';
import { ClassModelAction } from '../model-actions/class.actions';

import { ClassService } from './class.service';

// Mock Data Constants
const MOCK_CLASS_ID = '1';
const MOCK_SESSION_ID = '2023-2024';
const MOCK_ACTIVE_SESSION = '2024-2025';

const mockClass = {
  id: MOCK_CLASS_ID,
  name: 'Grade 10',
  streams: [{ name: 'Science' }],
} as unknown as Class;

const mockTeacherAssignment = {
  id: 10,
  assignment_date: new Date('2023-09-01'),
  session_id: MOCK_SESSION_ID,
  is_active: true,
  teacher: {
    id: 'teacher-uuid-101',
    employment_id: 'EMP-2025-001',
    user: {
      first_name: 'John',
      last_name: 'Doe',
    },
  },
  class: mockClass,
} as unknown as ClassTeacher;

describe('ClassService', () => {
  let service: ClassService;
  let classModelAction: jest.Mocked<ClassModelAction>;
  let classTeacherModelAction: jest.Mocked<ClassTeacherModelAction>;
  let mockLogger: jest.Mocked<Logger>;

  const mockSessionModelAction = {
    get: jest.fn(),
    getActive: jest.fn().mockResolvedValue({ id: MOCK_ACTIVE_SESSION }),
  };

  const mockClassModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  const mockClassTeacherModelAction = {
    list: jest.fn(),
  };

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      log: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        {
          provide: ClassModelAction,
          useValue: mockClassModelAction,
        },
        {
          provide: ClassTeacherModelAction,
          useValue: mockClassTeacherModelAction,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest
              .fn()
              .mockImplementation((callback) => callback({})), // Mock manager as empty object
          },
        },
        {
          provide: AcademicSessionModelAction,
          useValue: mockSessionModelAction,
        },
      ],
    }).compile();

    service = module.get<ClassService>(ClassService);
    classModelAction = module.get(ClassModelAction);
    classTeacherModelAction = module.get(ClassTeacherModelAction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeachersByClass', () => {
    it('should return a list of mapped teachers for a specific session', async () => {
      classModelAction.get.mockResolvedValue(mockClass);
      classTeacherModelAction.list.mockResolvedValue({
        payload: [mockTeacherAssignment],
        paginationMeta: {},
      });

      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );

      expect(classModelAction.get).toHaveBeenCalledWith({
        identifierOptions: {
          id: MOCK_CLASS_ID,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        teacher_id: 'teacher-uuid-101',
        name: 'John Doe',
        assignment_date: mockTeacherAssignment.assignment_date,
        streams: 'Science',
      });
    });

    it('should use the active session if no session ID is provided', async () => {
      classModelAction.get.mockResolvedValue(mockClass);
      classTeacherModelAction.list.mockResolvedValue({
        payload: [mockTeacherAssignment],
        paginationMeta: {},
      });

      await service.getTeachersByClass(MOCK_CLASS_ID);

      expect(classTeacherModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: {
          class: { id: MOCK_CLASS_ID },
          session_id: MOCK_ACTIVE_SESSION,
          is_active: true,
        },
        relations: {
          teacher: { user: true },
          class: { streams: true },
        },
      });
    });

    it('should throw NotFoundException if the class does not exist', async () => {
      classModelAction.get.mockResolvedValue(null);

      await expect(
        service.getTeachersByClass('wrong-uuid', MOCK_SESSION_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return an empty array if class exists but has no teachers', async () => {
      const emptyPayload = {
        payload: [],
        paginationMeta: {},
      };
      classModelAction.get.mockResolvedValue(mockClass);
      classTeacherModelAction.list.mockResolvedValue(emptyPayload);

      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );

      expect(result).toEqual(emptyPayload.payload);
    });
  });

  describe('create', () => {
    const MOCK_CREATE_CLASS_DTO: CreateClassDto = {
      name: 'SSS 1',
      level: ClassLevel.SECONDARY,
    };

    const MOCK_CREATED_CLASS_ENTITY = {
      id: 'class-uuid-1',
      normalized_name: MOCK_CREATE_CLASS_DTO.name.toLowerCase(),
      // session_id is still required on the Class entity but is not part of the DTO
      session_id: 'session-uuid-1',
      ...MOCK_CREATE_CLASS_DTO,
    } as unknown as Class;

    it('should successfully create a class and return a success response', async () => {
      // Mock Dependencies
      // 1. Class does not exist (no conflict)
      mockClassModelAction.find.mockResolvedValue({ payload: [] });
      // 2. Successful creation in transaction
      mockClassModelAction.create.mockResolvedValue(MOCK_CREATED_CLASS_ENTITY);

      // Execute
      const result = await service.create(MOCK_CREATE_CLASS_DTO);

      // Assertions (1. Success)
      expect(result.status_code).toBe(201);
      expect(result.message).toBe('Class successfully created.');
      expect(result.data.id).toBe('class-uuid-1');

      // Assertions (2. Correct data passed for creation)
      expect(mockClassModelAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createPayload: {
            name: MOCK_CREATE_CLASS_DTO.name,
            normalized_name: MOCK_CREATE_CLASS_DTO.name.toLowerCase(),
            level: MOCK_CREATE_CLASS_DTO.level,
          },
        }),
      );
    });

    it('should successfully create a class and normalize the name from DTO', async () => {
      // Mock Dependencies
      mockClassModelAction.find.mockResolvedValue({ payload: [] });
      mockClassModelAction.create.mockResolvedValue(MOCK_CREATED_CLASS_ENTITY);

      // Input with extra whitespace and different casing (normalization test)
      const expectedNormalizedName = 'grade 7 science';
      const expectedCleanedName = 'gRaDe 7 ScIeNcE'; // Manually applied DTO logic: .trim().replace(/\s+/g, ' ')

      // Simulate the DTO transformation which is typically done by the NestJS pipeline
      const cleanedDto: CreateClassDto = {
        ...MOCK_CREATE_CLASS_DTO,
        name: expectedCleanedName,
      };

      // Execute
      await service.create(cleanedDto);

      // Assertions
      // The classModelAction.create should be called with the cleaned 'name' and fully 'normalized_name'
      expect(mockClassModelAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createPayload: {
            name: expectedCleanedName, // The DTO's @Transform should handle this
            normalized_name: expectedNormalizedName,
            level: MOCK_CREATE_CLASS_DTO.level,
          },
        }),
      );
    });

    it('should throw ConflictException if a class with the same normalized name already exists', async () => {
      // Mock Dependencies
      // 1. Mock conflict check to return an existing class
      mockClassModelAction.find.mockResolvedValue({
        payload: [{ id: 'existing-class-id' }],
      });
      // 2. Mock create to ensure it's not called
      mockClassModelAction.create.mockClear();

      // Execute & Assert
      await expect(
        service.create({
          ...MOCK_CREATE_CLASS_DTO,
          name: 'sss 1', // Case is different but normalized name will match
        }),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.create({
          ...MOCK_CREATE_CLASS_DTO,
          name: 'SSS 1',
        }),
      ).rejects.toThrow(
        new ConflictException(
          'A class with the same name already exists in this session.',
        ),
      );

      expect(mockClassModelAction.create).not.toHaveBeenCalled();
    });

    // NOTE ON SESSION ID: The session_id has been removed from CreateClassDto and is no longer checked in the service.
    // The previous test for 'invalid session ID' is now obsolete and has been removed.

    // NOTE ON DTO VALIDATION:
    // Cases like 'invalid class name/level data' (e.g., missing level, name with special chars)
    // are primarily handled by class-validator decorators in CreateClassDto (IsNotEmpty, Matches).
    // These tests should live in a separate spec file for CreateClassDto.
    // The service layer assumes the DTO has been validated by the NestJS pipeline.
  });
});
