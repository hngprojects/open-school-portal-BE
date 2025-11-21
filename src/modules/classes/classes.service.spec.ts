import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassesService } from './classes.service';
import { ClassTeacher } from './entities/class-teacher.entity';
import { Class } from './entities/classes.entity';

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
  let classRepository: Repository<Class>;
  let classTeacherRepository: Repository<ClassTeacher>;

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    classRepository = module.get<Repository<Class>>(getRepositoryToken(Class));
    classTeacherRepository = module.get<Repository<ClassTeacher>>(
      getRepositoryToken(ClassTeacher),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeachersByClass', () => {
    it('should return a list of mapped teachers for a specific session', async () => {
      // Arrange
      jest.spyOn(classRepository, 'findOne').mockResolvedValue(mockClass);
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
            stream: true,
          },
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        teacher_id: 'mock-teacher-uuid',
        name: 'John Doe',
        stream: 'Science',
      });
    });

    it('should use the active session if no session ID is provided', async () => {
      // Arrange
      jest.spyOn(classRepository, 'findOne').mockResolvedValue(mockClass);
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
      jest.spyOn(classRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getTeachersByClass('non-existent-class-uuid', MOCK_SESSION_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return an empty array if class exists but has no teachers', async () => {
      jest.spyOn(classRepository, 'findOne').mockResolvedValue(mockClass);
      jest.spyOn(classTeacherRepository, 'find').mockResolvedValue([]);

      const result = await service.getTeachersByClass(
        MOCK_CLASS_ID,
        MOCK_SESSION_ID,
      );

      expect(result).toEqual([]);
    });
  });
});
