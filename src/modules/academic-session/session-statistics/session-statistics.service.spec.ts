import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  AcademicSession,
  SessionStatus,
} from '../entities/academic-session.entity';

import { SessionsStatisticsService } from './session-statistics.service';

describe('SessionsStatisticsService', () => {
  let service: SessionsStatisticsService;
  let academicSessionRepository: Repository<AcademicSession>;
  let dataSource: DataSource;

  const mockAcademicSession = {
    id: 'session-123',
    name: '2024 Session',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-07-31'),
    status: SessionStatus.ACTIVE,
  };

  const mockAcademicSessionRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsStatisticsService,
        {
          provide: getRepositoryToken(AcademicSession),
          useValue: mockAcademicSessionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SessionsStatisticsService>(SessionsStatisticsService);
    academicSessionRepository = module.get<Repository<AcademicSession>>(
      getRepositoryToken(AcademicSession),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSessionStatistics', () => {
    const validSessionId = 'session-123';

    it('should return session statistics when session exists', async () => {
      // Arrange
      mockAcademicSessionRepository.findOne.mockResolvedValue(
        mockAcademicSession,
      );

      // Mock the optimized query result
      mockDataSource.query.mockResolvedValue([
        {
          class_count: '15',
          stream_count: '45',
          student_count: '1200',
          teacher_count: '60',
        },
      ]);

      // Act
      const result = await service.getSessionStatistics(validSessionId);

      // Assert
      expect(academicSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: validSessionId },
      });

      expect(result.sessionId).toBe('session-123');
      expect(result.sessionName).toBe('2024 Session');
      expect(result.totalClasses).toBe(15);
      expect(result.totalStreams).toBe(45);
      expect(result.totalStudents).toBe(1200);
      expect(result.totalTeachers).toBe(60);
      expect(result.status).toBe(SessionStatus.ACTIVE);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when session does not exist', async () => {
      // Arrange
      const sessionId = 'non-existent-id';
      mockAcademicSessionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getSessionStatistics(sessionId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockAcademicSessionRepository.findOne).toHaveBeenCalledWith({
        where: { id: sessionId },
      });
    });

    it('should handle session with no data (all zeros)', async () => {
      // Arrange
      mockAcademicSessionRepository.findOne.mockResolvedValue(
        mockAcademicSession,
      );
      mockDataSource.query.mockResolvedValue([
        {
          class_count: '0',
          stream_count: '0',
          student_count: '0',
          teacher_count: '0',
        },
      ]);

      // Act
      const result = await service.getSessionStatistics(validSessionId);

      // Assert
      expect(result.totalClasses).toBe(0);
      expect(result.totalStreams).toBe(0);
      expect(result.totalStudents).toBe(0);
      expect(result.totalTeachers).toBe(0);
    });

    it('should handle null counts from database', async () => {
      // Arrange
      mockAcademicSessionRepository.findOne.mockResolvedValue(
        mockAcademicSession,
      );
      mockDataSource.query.mockResolvedValue([
        {
          class_count: null,
          stream_count: null,
          student_count: null,
          teacher_count: null,
        },
      ]);

      // Act
      const result = await service.getSessionStatistics(validSessionId);

      // Assert
      expect(result.totalClasses).toBe(0);
      expect(result.totalStreams).toBe(0);
      expect(result.totalStudents).toBe(0);
      expect(result.totalTeachers).toBe(0);
    });

    it('should handle empty query result array', async () => {
      // Arrange
      mockAcademicSessionRepository.findOne.mockResolvedValue(
        mockAcademicSession,
      );
      mockDataSource.query.mockResolvedValue([]);

      // Act
      const result = await service.getSessionStatistics(validSessionId);

      // Assert
      expect(result.totalClasses).toBe(0);
      expect(result.totalStreams).toBe(0);
      expect(result.totalStudents).toBe(0);
      expect(result.totalTeachers).toBe(0);
    });
  });
});
