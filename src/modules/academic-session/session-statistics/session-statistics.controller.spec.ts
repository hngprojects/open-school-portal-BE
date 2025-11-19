import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { SessionStatus } from '../entities/academic-session.entity';

import { SessionStatisticsResponseDto } from './dto/session-statistics-response.dto';
import { SessionsStatisticsController } from './session-statistics.controller';
import { SessionsStatisticsService } from './session-statistics.service';

describe('SessionsStatisticsController', () => {
  let controller: SessionsStatisticsController;
  let service: SessionsStatisticsService;

  const validSessionId = '550e8400-e29b-41d4-a716-446655440000';

  const mockSessionStatisticsResponse: SessionStatisticsResponseDto = {
    sessionId: validSessionId,
    sessionName: '2024/2025 Academic Session',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-07-31'),
    status: SessionStatus.ACTIVE,
    totalClasses: 15,
    totalStreams: 45,
    totalStudents: 1250,
    totalTeachers: 65,
    generatedAt: new Date('2024-09-15T10:30:00.000Z'),
  };

  const mockSessionsStatisticsService = {
    getSessionStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsStatisticsController],
      providers: [
        {
          provide: SessionsStatisticsService,
          useValue: mockSessionsStatisticsService,
        },
      ],
    }).compile();

    controller = module.get<SessionsStatisticsController>(
      SessionsStatisticsController,
    );
    service = module.get<SessionsStatisticsService>(SessionsStatisticsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSessionStatistics', () => {
    it('should return session statistics when session exists', async () => {
      // Arrange
      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        mockSessionStatisticsResponse,
      );

      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(service.getSessionStatistics).toHaveBeenCalledTimes(1);
      expect(service.getSessionStatistics).toHaveBeenCalledWith(validSessionId);

      expect(result).toEqual(mockSessionStatisticsResponse);
      expect(result.sessionId).toBe(validSessionId);
      expect(result.sessionName).toBe('2024/2025 Academic Session');
      expect(result.totalClasses).toBe(15);
      expect(result.totalStreams).toBe(45);
      expect(result.totalStudents).toBe(1250);
      expect(result.totalTeachers).toBe(65);
    });

    it('should call service with correct session ID from params', async () => {
      // Arrange
      const differentSessionId = '660e8400-e29b-41d4-a716-446655440001';
      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue({
        ...mockSessionStatisticsResponse,
        sessionId: differentSessionId,
      });

      const params = { id: differentSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(service.getSessionStatistics).toHaveBeenCalledWith(
        differentSessionId,
      );
      expect(result.sessionId).toBe(differentSessionId);
    });

    it('should handle empty session statistics', async () => {
      // Arrange
      const emptyStatistics: SessionStatisticsResponseDto = {
        sessionId: validSessionId,
        sessionName: 'Empty Session',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        status: SessionStatus.INACTIVE,
        totalClasses: 0,
        totalStreams: 0,
        totalStudents: 0,
        totalTeachers: 0,
        generatedAt: new Date(),
      };

      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        emptyStatistics,
      );
      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(result.totalClasses).toBe(0);
      expect(result.totalStudents).toBe(0);
      expect(result.totalTeachers).toBe(0);
      expect(result.totalStreams).toBe(0);
      expect(result.status).toBe(SessionStatus.INACTIVE);
    });

    it('should propagate NotFoundException when service throws it', async () => {
      // Arrange
      const nonExistentSessionId = '00000000-0000-0000-0000-000000000000';
      const notFoundError = new NotFoundException(
        `Academic session with ID ${nonExistentSessionId} not found`,
      );

      mockSessionsStatisticsService.getSessionStatistics.mockRejectedValue(
        notFoundError,
      );
      const params = { id: nonExistentSessionId };

      // Act & Assert
      await expect(controller.getSessionStatistics(params)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getSessionStatistics(params)).rejects.toThrow(
        `Academic session with ID ${nonExistentSessionId} not found`,
      );

      expect(service.getSessionStatistics).toHaveBeenCalledWith(
        nonExistentSessionId,
      );
    });

    it('should propagate other errors from service', async () => {
      // Arrange
      const serverError = new Error('Database connection failed');
      mockSessionsStatisticsService.getSessionStatistics.mockRejectedValue(
        serverError,
      );
      const params = { id: validSessionId };

      // Act & Assert
      await expect(controller.getSessionStatistics(params)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle session with only some statistics available', async () => {
      // Arrange
      const partialStatistics: SessionStatisticsResponseDto = {
        sessionId: validSessionId,
        sessionName: 'Partial Session',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        status: SessionStatus.ACTIVE,
        totalClasses: 5,
        totalStreams: 0, // No streams
        totalStudents: 150,
        totalTeachers: 8,
        generatedAt: new Date(),
      };

      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        partialStatistics,
      );
      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(result.totalClasses).toBe(5);
      expect(result.totalStreams).toBe(0); // Should handle zero streams
      expect(result.totalStudents).toBe(150);
      expect(result.totalTeachers).toBe(8);
    });
  });

  describe('controller metadata', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have correct API tags and route', () => {
      // This tests the decorators indirectly
      const controllerProto = Object.getPrototypeOf(controller);
      const apiTagsMetadata = Reflect.getMetadata(
        'swagger/apiUseTags',
        controllerProto.constructor,
      );
      const controllerPath = Reflect.getMetadata(
        'path',
        controllerProto.constructor,
      );

      expect(apiTagsMetadata).toEqual(['academic-sessions']);
      expect(controllerPath).toBe('academic-sessions');
    });

    it('should have correct method metadata', () => {
      const controllerProto = Object.getPrototypeOf(controller);
      const methodMetadata = Reflect.getMetadata(
        'path',
        controllerProto.getSessionStatistics,
      );
      const method = Reflect.getMetadata(
        'method',
        controllerProto.getSessionStatistics,
      );

      expect(methodMetadata).toBe(':id/statistics');
      expect(method).toBe(0); // 0 corresponds to GET in NestJS
    });
  });

  // Edge case tests
  describe('edge cases', () => {
    it('should handle very large numbers in statistics', async () => {
      // Arrange
      const largeStatistics: SessionStatisticsResponseDto = {
        sessionId: validSessionId,
        sessionName: 'Large School Session',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        status: SessionStatus.ACTIVE,
        totalClasses: 1000,
        totalStreams: 3000,
        totalStudents: 50000,
        totalTeachers: 2000,
        generatedAt: new Date(),
      };

      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        largeStatistics,
      );
      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(result.totalStudents).toBe(50000);
      expect(result.totalTeachers).toBe(2000);
      expect(result.totalClasses).toBe(1000);
    });

    it('should handle session with INACTIVE status', async () => {
      // Arrange
      const inactiveSessionStats: SessionStatisticsResponseDto = {
        ...mockSessionStatisticsResponse,
        status: SessionStatus.INACTIVE,
      };

      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        inactiveSessionStats,
      );
      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(result.status).toBe(SessionStatus.INACTIVE);
    });
  });

  // Performance and behavior tests
  describe('performance and behavior', () => {
    it('should only call service once per request', async () => {
      // Arrange
      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        mockSessionStatisticsResponse,
      );
      const params = { id: validSessionId };

      // Act
      await controller.getSessionStatistics(params);

      // Assert
      expect(service.getSessionStatistics).toHaveBeenCalledTimes(1);
    });

    it('should maintain response structure', async () => {
      // Arrange
      mockSessionsStatisticsService.getSessionStatistics.mockResolvedValue(
        mockSessionStatisticsResponse,
      );
      const params = { id: validSessionId };

      // Act
      const result = await controller.getSessionStatistics(params);

      // Assert
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('sessionName');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('totalClasses');
      expect(result).toHaveProperty('totalStreams');
      expect(result).toHaveProperty('totalStudents');
      expect(result).toHaveProperty('totalTeachers');
      expect(result).toHaveProperty('generatedAt');
    });
  });
});
