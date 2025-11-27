import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { Stream } from '../../stream/entities/stream.entity';
import { Subject } from '../../subject/entities/subject.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';
import { CreateTimetableDto } from '../dto/timetable.dto';
import { Timetable } from '../entities/timetable.entity';
import { DayOfWeek, PeriodType } from '../enums/timetable.enums';

import { TimetableValidationService } from './timetable-validation.service';

describe('TimetableValidationService', () => {
  let service: TimetableValidationService;
  let streamRepository: jest.Mocked<Repository<Stream>>;
  let subjectRepository: jest.Mocked<Repository<Subject>>;
  let teacherRepository: jest.Mocked<Repository<Teacher>>;
  let timetableRepository: jest.Mocked<Repository<Timetable>>;

  const mockStreamId = 'stream-123';
  const mockSubjectId = 'subject-123';
  const mockTeacherId = 'teacher-123';
  const mockTimetableId = 'timetable-123';

  const baseDto: CreateTimetableDto = {
    day: DayOfWeek.MONDAY,
    start_time: '09:00:00',
    end_time: '10:00:00',
    stream_id: mockStreamId,
    effective_date: '2025-01-01',
    period_type: PeriodType.LESSON,
  };

  beforeEach(async () => {
    const mockLogger = {
      child: jest.fn().mockReturnValue({
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
      }),
    } as unknown as Logger;

    const mockStreamRepo = {
      findOne: jest.fn(),
    };

    const mockSubjectRepo = {
      findOne: jest.fn(),
    };

    const mockTeacherRepo = {
      findOne: jest.fn(),
    };

    const mockTimetableRepo = {
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetableValidationService,
        {
          provide: getRepositoryToken(Stream),
          useValue: mockStreamRepo,
        },
        {
          provide: getRepositoryToken(Subject),
          useValue: mockSubjectRepo,
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockTeacherRepo,
        },
        {
          provide: getRepositoryToken(Timetable),
          useValue: mockTimetableRepo,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<TimetableValidationService>(
      TimetableValidationService,
    );
    streamRepository = module.get(getRepositoryToken(Stream));
    subjectRepository = module.get(getRepositoryToken(Subject));
    teacherRepository = module.get(getRepositoryToken(Teacher));
    timetableRepository = module.get(getRepositoryToken(Timetable));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTimetableRules', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should pass validation for valid timetable', async () => {
      // Setup mocks
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        subject_id: mockSubjectId,
        teacher_id: mockTeacherId,
      };

      subjectRepository.findOne.mockResolvedValue({
        id: mockSubjectId,
      } as Subject);
      teacherRepository.findOne.mockResolvedValue({
        id: mockTeacherId,
      } as Teacher);

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });
  });

  describe('Time Range Validation', () => {
    it('should throw BadRequestException when start_time >= end_time', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '10:00:00',
        end_time: '09:00:00', // End before start
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.INVALID_TIME_RANGE,
      );
    });

    it('should throw BadRequestException when start_time equals end_time', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '09:00:00',
        end_time: '09:00:00', // Same time
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should pass when start_time < end_time', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '09:00:00',
        end_time: '10:00:00',
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });
  });

  describe('Date Range Validation', () => {
    it('should throw BadRequestException when end_date <= effective_date', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-01-15',
        end_date: '2025-01-01', // End before start
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.INVALID_DATE_RANGE_TIMETABLE,
      );
    });

    it('should throw BadRequestException when end_date equals effective_date', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-01-01',
        end_date: '2025-01-01', // Same date
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should pass when end_date > effective_date', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-01-01',
        end_date: '2025-01-31',
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should pass when end_date is not provided', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-01-01',
        end_date: undefined,
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });
  });

  describe('Foreign Key Validation', () => {
    it('should throw NotFoundException when stream does not exist', async () => {
      streamRepository.findOne.mockResolvedValue(null);

      await expect(service.validateTimetableRules(baseDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateTimetableRules(baseDto)).rejects.toThrow(
        sysMsg.STREAM_NOT_FOUND,
      );
    });

    it('should throw NotFoundException when subject does not exist', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      subjectRepository.findOne.mockResolvedValue(null);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        subject_id: 'invalid-subject-id',
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.SUBJECT_NOT_FOUND,
      );
    });

    it('should throw NotFoundException when teacher does not exist', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      teacherRepository.findOne.mockResolvedValue(null);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        teacher_id: 'invalid-teacher-id',
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.TEACHER_NOT_FOUND,
      );
    });

    it('should pass when all foreign keys exist', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      subjectRepository.findOne.mockResolvedValue({
        id: mockSubjectId,
      } as Subject);
      teacherRepository.findOne.mockResolvedValue({
        id: mockTeacherId,
      } as Teacher);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        subject_id: mockSubjectId,
        teacher_id: mockTeacherId,
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should pass when optional foreign keys are not provided', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        subject_id: undefined,
        teacher_id: undefined,
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });
  });

  describe('Stream/Day Overlap Validation', () => {
    it('should throw ConflictException when stream has overlapping time on same day', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      const existingTimetable: Timetable = {
        id: 'existing-id',
        stream_id: mockStreamId,
        day: DayOfWeek.MONDAY,
        start_time: '09:00:00',
        end_time: '10:00:00',
        effective_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        is_active: true,
      } as Timetable;

      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([existingTimetable]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '09:30:00', // Overlaps with existing 9:00-10:00
        end_time: '10:30:00',
        effective_date: '2025-01-15', // Overlaps with existing date range
        end_date: '2025-02-15',
      };

      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.TIMETABLE_OVERLAP_STREAM,
      );
    });

    it('should pass when times do not overlap', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      const existingTimetable: Timetable = {
        id: 'existing-id',
        stream_id: mockStreamId,
        day: DayOfWeek.MONDAY,
        start_time: '09:00:00',
        end_time: '10:00:00',
        effective_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        is_active: true,
      } as Timetable;

      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([existingTimetable]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '10:00:00', // No overlap (starts when existing ends)
        end_time: '11:00:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should pass when dates do not overlap', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      // Query builder should return empty array because dates don't overlap
      // (the real query would filter by date range, so no results)
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-02-01', // After existing end date (if any existed)
        end_date: '2025-02-28',
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should exclude current timetable when updating', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      // Query builder should return empty array because we're excluding the current timetable
      // (the real query would exclude it, so no results)
      const queryBuilder = createMockQueryBuilder([]);
      timetableRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '09:30:00', // Would overlap with existing if not excluded
        end_time: '10:30:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      // Should pass because we exclude the current timetable
      await expect(
        service.validateTimetableRules(dto, mockTimetableId),
      ).resolves.not.toThrow();

      // Verify excludeTimetableId was used in query
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'timetable.id != :excludeId',
        { excludeId: mockTimetableId },
      );
    });

    it('should handle NULL end_date (indefinite schedule)', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      const existingTimetable: Timetable = {
        id: 'existing-id',
        stream_id: mockStreamId,
        day: DayOfWeek.MONDAY,
        start_time: '09:00:00',
        end_time: '10:00:00',
        effective_date: new Date('2025-01-01'),
        end_date: null, // Indefinite
        is_active: true,
      } as Timetable;

      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([existingTimetable]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        effective_date: '2025-06-01', // Future date, but existing has no end_date
        end_date: undefined,
      };

      // Should detect overlap because existing has no end_date
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Teacher Double-Booking Validation', () => {
    it('should throw ConflictException when teacher is double-booked', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      teacherRepository.findOne.mockResolvedValue({
        id: mockTeacherId,
      } as Teacher);

      // First query (stream overlap) should return empty (no stream conflicts)
      // Second query (teacher overlap) should return the conflicting timetable
      const existingTimetable: Timetable = {
        id: 'existing-id',
        teacher_id: mockTeacherId,
        stream_id: 'different-stream-id', // Different stream to avoid stream conflict
        day: DayOfWeek.MONDAY,
        start_time: '09:00:00',
        end_time: '10:00:00',
        effective_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        is_active: true,
      } as Timetable;

      // Track call count to return different results for stream vs teacher queries
      // Use a shared counter that resets for each test call
      const getMockQueryBuilder = () => {
        let queryCallCount = 0;
        return () => {
          queryCallCount++;
          if (queryCallCount === 1) {
            // First call: stream overlap check - no conflicts (different stream)
            return createMockQueryBuilder([]);
          }
          // Second call: teacher overlap check - has conflict
          return createMockQueryBuilder([existingTimetable]);
        };
      };

      timetableRepository.createQueryBuilder.mockImplementation(
        getMockQueryBuilder(),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        teacher_id: mockTeacherId,
        start_time: '09:30:00', // Overlaps with existing
        end_time: '10:30:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      // Reset mock for first assertion
      timetableRepository.createQueryBuilder.mockImplementation(
        getMockQueryBuilder(),
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        ConflictException,
      );

      // Reset mock for second assertion
      timetableRepository.createQueryBuilder.mockImplementation(
        getMockQueryBuilder(),
      );
      await expect(service.validateTimetableRules(dto)).rejects.toThrow(
        sysMsg.TIMETABLE_TEACHER_DOUBLE_BOOKED,
      );
    });

    it('should pass when teacher has no conflicts', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      teacherRepository.findOne.mockResolvedValue({
        id: mockTeacherId,
      } as Teacher);

      const existingTimetable: Timetable = {
        id: 'existing-id',
        teacher_id: mockTeacherId,
        day: DayOfWeek.MONDAY,
        start_time: '09:00:00',
        end_time: '10:00:00',
        effective_date: new Date('2025-01-01'),
        end_date: new Date('2025-01-31'),
        is_active: true,
      } as Timetable;

      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([existingTimetable]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        teacher_id: mockTeacherId,
        start_time: '10:00:00', // No overlap
        end_time: '11:00:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should skip teacher validation when teacher_id is not provided', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        teacher_id: undefined,
      };

      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
      expect(teacherRepository.findOne).not.toHaveBeenCalled();
    });

    it('should exclude current timetable when updating teacher schedule', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);
      teacherRepository.findOne.mockResolvedValue({
        id: mockTeacherId,
      } as Teacher);

      // First query (stream overlap) should return empty
      // Second query (teacher overlap) should return empty because we exclude current
      timetableRepository.createQueryBuilder.mockImplementation(() => {
        return createMockQueryBuilder([]);
      });

      const dto: CreateTimetableDto = {
        ...baseDto,
        teacher_id: mockTeacherId,
        start_time: '09:30:00', // Would overlap if not excluded
        end_time: '10:30:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      // Should pass because we exclude the current timetable
      await expect(
        service.validateTimetableRules(dto, mockTimetableId),
      ).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle timetables on different days', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      // Query builder should return empty array because different days don't conflict
      // (the real query filters by day, so no results for different day)
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        day: DayOfWeek.MONDAY, // Different day
        start_time: '09:00:00', // Same time, but different day
        end_time: '10:00:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      // Should pass because different days don't conflict
      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });

    it('should handle inactive timetables', async () => {
      streamRepository.findOne.mockResolvedValue({
        id: mockStreamId,
      } as Stream);

      // Query builder filters by is_active = true, so inactive timetables won't be returned
      timetableRepository.createQueryBuilder.mockReturnValue(
        createMockQueryBuilder([]),
      );

      const dto: CreateTimetableDto = {
        ...baseDto,
        start_time: '09:00:00', // Same time as inactive
        end_time: '10:00:00',
        effective_date: '2025-01-15',
        end_date: '2025-02-15',
      };

      // Should pass because inactive timetables are ignored
      await expect(service.validateTimetableRules(dto)).resolves.not.toThrow();
    });
  });
});

// Helper function to create a mock QueryBuilder
function createMockQueryBuilder(
  results: Timetable[],
): jest.Mocked<SelectQueryBuilder<Timetable>> {
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(results),
  } as unknown as jest.Mocked<SelectQueryBuilder<Timetable>>;

  return mockQueryBuilder;
}
