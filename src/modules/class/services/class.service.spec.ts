import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ClassLevel } from '../../shared/enums';
import { ClassTeacher } from '../entities/class-teacher.entity';
import { Class } from '../entities/class.entity';
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
  level: ClassLevel.JUNIOR_SECONDARY,
  streams: [{ name: 'Science' }],
  teacher_assignment: [],
  createdAt: new Date(),
  updatedAt: new Date(),
} as Class;

const mockUser = {
  id: 'mock-user-uuid',
  first_name: 'John',
  last_name: 'Doe',
  middle_name: '',
  gender: 'male',
  dob: new Date('1990-01-01'),
  email: 'john.doe@example.com',
  phone: '1234567890',
  homeAddress: '',
  role: ['TEACHER'],
  password: 'hashedPassword',
  is_active: true,
  is_verified: true,
  sessions: [],
  teacher: undefined,
  last_login_at: null,
  reset_token: undefined,
  reset_token_expiry: undefined,
  deleted_at: null,
  stream: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeacherAssignment = {
  id: '10',
  createdAt: new Date('2023-09-01'),
  updatedAt: new Date('2023-09-01'), // <-- Add missing updatedAt property
  session_id: MOCK_SESSION_ID,
  is_active: true,
  teacher: {
    id: 'teacher-uuid-101',
    employment_id: 'EMP-2025-001',
    user: mockUser,
    class_assignments: [],
    title: undefined,
    photo_url: '',
    is_active: true,
    user_id: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  class: mockClass,
} as ClassTeacher;

describe('ClassService', () => {
  let service: ClassService;
  let classModelAction: jest.Mocked<ClassModelAction>;
  let classTeacherModelAction: jest.Mocked<ClassTeacherModelAction>;
  let mockLogger: jest.Mocked<Logger>;

  const mockClassModelAction = {
    get: jest.fn(),
    create: jest.fn(),
    list: jest.fn(),
  };

  const mockClassTeacherModelAction = {
    list: jest.fn(),
  };

  const mockClassTeacherRepository = {
    find: jest.fn(),
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
          provide: getRepositoryToken(ClassTeacher),
          useValue: mockClassTeacherRepository,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
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
      mockClassTeacherRepository.find.mockResolvedValue([
        mockTeacherAssignment,
      ]);

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
        teacher_id: Number(mockTeacherAssignment.teacher.id),
        name: 'John Doe',
        assignment_date: mockTeacherAssignment.createdAt,
        streams: ['Science'],
      });
    });

    it('should use the active session if no session ID is provided', async () => {
      classModelAction.get.mockResolvedValue(mockClass);
      mockClassTeacherRepository.find.mockResolvedValue([
        mockTeacherAssignment,
      ]);

      await service.getTeachersByClass(MOCK_CLASS_ID);

      expect(classTeacherModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: {
          class: { id: MOCK_CLASS_ID },
          session_id: MOCK_ACTIVE_SESSION,
          is_active: true,
        },
        relations: {
          teacher: { user: true },
          class: true,
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
      mockClassTeacherRepository.find.mockResolvedValue(emptyPayload.payload);

      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );

      expect(result).toEqual(emptyPayload.payload);
    });
  });

  describe('createClass', () => {
    it('should create a new class when valid data is provided', async () => {
      const createClassDto = {
        class_name: 'Grade 11',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      const mockCreatedClass = {
        id: 'new-class-id',
        name: 'Grade 11',
        level: ClassLevel.JUNIOR_SECONDARY,
        streams: [],
        teacher_assignment: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Class;
      jest.spyOn(service['classesModelAction'], 'get').mockResolvedValue(null);
      jest
        .spyOn(service['classesModelAction'], 'create')
        .mockResolvedValue(mockCreatedClass);
      const result = await service.createClass(createClassDto);
      expect(result).toEqual(mockCreatedClass);
    });

    it('should throw BadRequestException if class name is empty', async () => {
      const createClassDto = {
        class_name: '   ',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      jest.spyOn(service['classesModelAction'], 'get').mockResolvedValue(null);
      jest
        .spyOn(service['classesModelAction'], 'create')
        .mockResolvedValue(undefined);
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'Invalid class parameter',
      );
    });

    it('should throw BadRequestException if level is invalid', async () => {
      const createClassDto = {
        class_name: 'Grade 12',
        level: 'INVALID' as unknown as ClassLevel,
      };
      jest.spyOn(service['classesModelAction'], 'get').mockResolvedValue(null);
      jest
        .spyOn(service['classesModelAction'], 'create')
        .mockResolvedValue(undefined);
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'Invalid class parameter',
      );
    });

    it('should throw BadRequestException if class already exists', async () => {
      const createClassDto = {
        class_name: 'Grade 10',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      jest
        .spyOn(service['classesModelAction'], 'get')
        .mockResolvedValue(mockClass);
      jest
        .spyOn(service['classesModelAction'], 'create')
        .mockResolvedValue(undefined);
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'Class already exists',
      );
    });
  });

  describe('getAllClassesGroupedByLevel', () => {
    it('should group classes by level and return correct structure', async () => {
      const mockClasses = [
        {
          id: '1',
          name: 'Grade 10',
          level: ClassLevel.JUNIOR_SECONDARY,
          streams: [{ name: 'Science' }, { name: 'Art' }],
          teacher_assignment: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Grade 11',
          level: ClassLevel.JUNIOR_SECONDARY,
          streams: [{ name: 'Commerce' }],
          teacher_assignment: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Grade 12',
          level: ClassLevel.SENIOR_SECONDARY,
          streams: [],
          teacher_assignment: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Class[];
      jest
        .spyOn(service['classesModelAction'], 'list')
        .mockResolvedValue({ payload: mockClasses, paginationMeta: {} });
      const result = await service.getAllClassesGroupedByLevel();
      expect(result).toEqual([
        {
          level: ClassLevel.JUNIOR_SECONDARY,
          classes: [
            {
              id: '1',
              name: 'Grade 10',
              level: ClassLevel.JUNIOR_SECONDARY,
              stream_count: 2,
              streams: ['Science', 'Art'],
            },
            {
              id: '2',
              name: 'Grade 11',
              level: ClassLevel.JUNIOR_SECONDARY,
              stream_count: 1,
              streams: ['Commerce'],
            },
          ],
        },
        {
          level: ClassLevel.SENIOR_SECONDARY,
          classes: [
            {
              id: '3',
              name: 'Grade 12',
              level: ClassLevel.SENIOR_SECONDARY,
              stream_count: 0,
              streams: [],
            },
          ],
        },
      ]);
    });
  });
});
