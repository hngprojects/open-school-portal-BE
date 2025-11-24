import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import * as sysMsg from '../../../constants/system.messages';
import { AcademicSessionModelAction } from '../../academic-session/model-actions/academic-session-actions';
import { ClassModelAction } from '../../class/model-actions/class.actions';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { SessionStreamModelAction } from '../model-actions/session-stream.model-action';
import { StreamModelAction } from '../model-actions/stream.model-action';

import { StreamService } from './stream.service';

interface IMockModelAction {
  create: jest.Mock;
  get: jest.Mock;
  list: jest.Mock;
}

interface IMockLogger {
  warn: jest.Mock;
  info: jest.Mock;
  error: jest.Mock;
  child: jest.Mock;
}

describe('StreamService', () => {
  let service: StreamService;
  let streamModelAction: IMockModelAction;
  let classModelAction: IMockModelAction;
  let academicSessionModelAction: IMockModelAction;
  let sessionStreamModelAction: IMockModelAction;
  let logger: IMockLogger;

  const mockClassId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(async () => {
    const createMockAction = () => ({
      create: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
    });

    const mockLoggerObj = {
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        { provide: StreamModelAction, useValue: createMockAction() },
        { provide: ClassModelAction, useValue: createMockAction() },
        { provide: AcademicSessionModelAction, useValue: createMockAction() },
        { provide: SessionStreamModelAction, useValue: createMockAction() },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLoggerObj },
      ],
    }).compile();

    service = module.get<StreamService>(StreamService);
    streamModelAction = module.get(StreamModelAction);
    classModelAction = module.get(ClassModelAction);
    academicSessionModelAction = module.get(AcademicSessionModelAction);
    sessionStreamModelAction = module.get(SessionStreamModelAction);
    logger = module.get(WINSTON_MODULE_PROVIDER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    const createDto: CreateStreamDto = {
      name: 'Gold',
      class_id: mockClassId,
    };

    it('should create a stream and auto-link to active session', async () => {
      classModelAction.get.mockResolvedValue({ id: mockClassId });

      streamModelAction.get.mockResolvedValue(null);

      const newStream = {
        id: 'new-stream-id',
        name: createDto.name,
        class_id: createDto.class_id,
        createdAt: new Date(),
      };
      streamModelAction.create.mockResolvedValue(newStream);

      const activeSession = { id: 'session-id', name: '2024/2025' };
      academicSessionModelAction.list.mockResolvedValue({
        payload: [activeSession],
      });

      sessionStreamModelAction.create.mockResolvedValue({});

      const result = await service.create(createDto);

      expect(classModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: mockClassId },
      });

      expect(streamModelAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createPayload: { name: 'Gold', class_id: mockClassId },
        }),
      );

      expect(academicSessionModelAction.list).toHaveBeenCalled();
      expect(sessionStreamModelAction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createPayload: { session: activeSession, stream: newStream },
        }),
      );

      expect(result.name).toBe('Gold');
    });

    it('should throw NotFoundException if class does not exist', async () => {
      classModelAction.get.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        sysMsg.CLASS_NOT_FOUND,
      );
    });

    it('should throw ConflictException if stream name already exists in class', async () => {
      classModelAction.get.mockResolvedValue({ id: mockClassId });
      streamModelAction.get.mockResolvedValue({ id: 'existing-stream-id' });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        sysMsg.STREAM_ALREADY_EXISTS_IN_CLASS,
      );
    });

    it('should continue gracefully and log warning if auto-linking fails', async () => {
      classModelAction.get.mockResolvedValue({ id: mockClassId });
      streamModelAction.get.mockResolvedValue(null);

      const newStream = {
        id: '1',
        name: createDto.name,
        class_id: createDto.class_id,
        createdAt: new Date(),
      };
      streamModelAction.create.mockResolvedValue(newStream);

      academicSessionModelAction.list.mockRejectedValue(new Error('DB Error'));

      await service.create(createDto);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to auto-link stream'),
      );
    });
  });

  describe('getStreamsByClass', () => {
    it('should return streams with student counts when class exists', async () => {
      const mockStreams = [
        {
          id: 'stream-1',
          name: 'Gold',
          class_id: mockClassId,
          students: [{ id: 'student-1' }, { id: 'student-2' }], // 2 students
        },
        {
          id: 'stream-2',
          name: 'Silver',
          class_id: mockClassId,
          students: [], // 0 students
        },
      ];

      classModelAction.get.mockResolvedValue({ id: mockClassId });

      streamModelAction.list.mockResolvedValue({
        payload: mockStreams,
        paginationMeta: {},
      });

      // Act
      const result = await service.getStreamsByClass(mockClassId);

      // Assert
      expect(classModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: mockClassId },
      });
      expect(streamModelAction.list).toHaveBeenCalledWith(
        expect.objectContaining({
          filterRecordOptions: { class_id: mockClassId },
          relations: { students: true },
        }),
      );

      expect(result).toHaveLength(2);
      expect(result[0].student_count).toBe(2);
      expect(result[1].student_count).toBe(0);
    });

    it('should throw NotFoundException if class does not exist', async () => {
      classModelAction.get.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getStreamsByClass(mockClassId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getStreamsByClass(mockClassId)).rejects.toThrow(
        sysMsg.CLASS_NOT_FOUND,
      );
    });
  });
});
