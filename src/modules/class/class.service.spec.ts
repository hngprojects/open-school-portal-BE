import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassLevel } from '../shared/enums';

import { ClassesService } from './class.service';
import { ClassTeacher } from './entities/class-teacher.entity';
import { Class } from './entities/class.entity';
import { ClassesModelAction } from './model-actions/class-action';

// Mock Data Constants
const MOCK_CLASS_ID = 'mock-class-uuid';
const MOCK_SESSION_ID = '2023-2024';
const MOCK_ACTIVE_SESSION = '2024-2025';

const mockClass = {
  id: MOCK_CLASS_ID,
  name: 'Grade 10',
  stream: 'Science',
} as unknown as Class;

const mockTeacherAssignment = {
  id: 'mock-assignment-uuid',
  session_id: MOCK_SESSION_ID,
  is_active: true,
  teacher: {
    id: 'mock-teacher-uuid',
    employmentId: 'EMP-2025-001',
    user: {
      first_name: 'John',
      last_name: 'Doe',
    },
  },
  class: mockClass,
} as unknown as ClassTeacher;

describe('ClassesService', () => {
  let service: ClassesService;
  let classTeacherRepository: Repository<ClassTeacher>;
  let classesModelAction: {
    get: jest.Mock;
    create: jest.Mock;
    list: jest.Mock;
  };

  beforeEach(async () => {
    classesModelAction = {
      get: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(Class),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ClassTeacher),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: ClassesModelAction,
          useValue: classesModelAction,
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    // classRepository = module.get<Repository<Class>>(getRepositoryToken(Class)); // removed unused variable
    classTeacherRepository = module.get<Repository<ClassTeacher>>(
      getRepositoryToken(ClassTeacher),
    );
    // Patch the private property for test access
    (
      service as unknown as { classesModelAction: typeof classesModelAction }
    ).classesModelAction = classesModelAction;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createClass', () => {
    it('should create a new class when valid data is provided', async () => {
      // Arrange
      const createClassDto = {
        class_name: 'Grade 11',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      const mockCreatedClass = {
        id: 'new-class-id',
        name: 'Grade 11',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      classesModelAction.get.mockResolvedValue(null);
      classesModelAction.create.mockResolvedValue(mockCreatedClass);

      // Act
      const result = await service.createClass(createClassDto);

      // Assert
      expect(classesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { name: 'Grade 11' },
      });
      expect(classesModelAction.create).toHaveBeenCalledWith({
        createPayload: { name: 'Grade 11', level: ClassLevel.JUNIOR_SECONDARY },
        transactionOptions: { useTransaction: false },
      });
      expect(result).toEqual(mockCreatedClass);
    });

    it('should throw BadRequestException if class name is empty', async () => {
      const createClassDto = {
        class_name: '   ',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'invalid class parameter',
      );
    });

    it('should throw BadRequestException if level is invalid', async () => {
      const createClassDto = {
        class_name: 'Grade 12',
        level: 'INVALID' as unknown as ClassLevel,
      };
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'invalid class parameter',
      );
    });

    it('should throw BadRequestException if class already exists', async () => {
      const createClassDto = {
        class_name: 'Grade 10',
        level: ClassLevel.JUNIOR_SECONDARY,
      };
      classesModelAction.get.mockResolvedValue({ id: 'existing-id' });
      await expect(service.createClass(createClassDto)).rejects.toThrow(
        'class already exists',
      );
    });
  });

  describe('getAllClassesGroupedByLevel', () => {
    it('should group classes by level and return correct structure', async () => {
      // Arrange
      const mockClasses = [
        {
          id: '1',
          name: 'Grade 10',
          level: 'JUNIOR',
          streams: [{ name: 'Science' }, { name: 'Art' }],
        },
        {
          id: '2',
          name: 'Grade 11',
          level: 'JUNIOR',
          streams: [{ name: 'Commerce' }],
        },
        { id: '3', name: 'Grade 12', level: 'SENIOR', streams: [] },
      ];
      classesModelAction.list.mockResolvedValue({ payload: mockClasses });

      // Act
      const result = await service.getAllClassesGroupedByLevel();

      // Assert
      expect(classesModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: {},
        relations: { streams: true },
      });
      expect(result).toEqual([
        {
          level: 'JUNIOR',
          classes: [
            {
              id: '1',
              name: 'Grade 10',
              level: 'JUNIOR',
              stream_count: 2,
              streams: ['Science', 'Art'],
            },
            {
              id: '2',
              name: 'Grade 11',
              level: 'JUNIOR',
              stream_count: 1,
              streams: ['Commerce'],
            },
          ],
        },
        {
          level: 'SENIOR',
          classes: [
            {
              id: '3',
              name: 'Grade 12',
              level: 'SENIOR',
              stream_count: 0,
              streams: [],
            },
          ],
        },
      ]);
    });
  });

  describe('getTeachersByClass', () => {
    it('should return a list of mapped teachers for a specific session', async () => {
      // Arrange
      classesModelAction.get.mockResolvedValue(mockClass);
      jest
        .spyOn(classTeacherRepository, 'find')
        .mockResolvedValue([mockTeacherAssignment]);

      // Act
      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );

      // Assert
      expect(classTeacherRepository.find).toHaveBeenCalledWith({
        where: {
          class: { id: MOCK_CLASS_ID },
          session_id: MOCK_SESSION_ID,
          is_active: true,
        },
        relations: ['teacher', 'teacher.user', 'class'],
        select: {
          id: true,
          teacher: {
            id: true,
            employmentId: true,
          },
          class: {
            id: true,
            streams: true,
          },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        teacher_id: 'mock-teacher-uuid',
        name: 'John Doe',
        assignment_date: undefined,
        streams: [],
      });
    });

    it('should use the active session if no session ID is provided', async () => {
      // Arrange
      classesModelAction.get.mockResolvedValue(mockClass);
      jest
        .spyOn(classTeacherRepository, 'find')
        .mockResolvedValue([mockTeacherAssignment]);

      // Act
      await service.getTeachersByClass(MOCK_CLASS_ID);

      // Assert
      expect(classTeacherRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            session_id: MOCK_ACTIVE_SESSION,
          }),
        }),
      );
    });

    it('should throw NotFoundException if the class does not exist', async () => {
      classesModelAction.get.mockResolvedValue(null);
      await expect(
        service.getTeachersByClass('non-existent-class-uuid', MOCK_SESSION_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return an empty array if class exists but has no teachers', async () => {
      classesModelAction.get.mockResolvedValue(mockClass);
      jest.spyOn(classTeacherRepository, 'find').mockResolvedValue([]);

      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );
      expect(result).toEqual([]);
    });
  });
});
