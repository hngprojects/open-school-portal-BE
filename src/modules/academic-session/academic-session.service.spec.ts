/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'; // Added HttpStatus
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';

import {
  AcademicSessionService,
  ICreateSessionResponse,
} from './academic-session.service';
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
    const mockModelActionProvider: Partial<AcademicSessionModelAction> = {
      get: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
    };

    mockSessionModelAction =
      mockModelActionProvider as unknown as jest.Mocked<AcademicSessionModelAction>;

    // Mock DataSource - required by AcademicSessionService constructor
    const mockDataSource: Partial<DataSource> = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicSessionService,
        {
          provide: AcademicSessionModelAction,
          useValue: mockSessionModelAction,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AcademicSessionService>(AcademicSessionService);
  });

  describe('create', () => {
    // Define a standard DTO and the corresponding full response object for reuse
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

    const expectedSuccessResponse: ICreateSessionResponse = {
      status_code: HttpStatus.OK, // Match service return
      message: sysMsg.ACADEMIC_SESSION_CREATED, // Match service return
      data: mockSession,
    };

    it('should create a new academic session successfully', async () => {
      mockSessionModelAction.get.mockResolvedValue(null);
      mockSessionModelAction.create.mockResolvedValue(mockSession);

      const result = await service.create(createDto);

      // ASSERTION CHANGE: Expect the full IcreateSessionResponse object
      expect(result).toEqual(expectedSuccessResponse);
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
      // Cast needed to satisfy TS type check for existing record
      mockSessionModelAction.get.mockResolvedValue({} as AcademicSession);

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException(sysMsg.DUPLICATE_SESSION_NAME),
      );
      expect(mockSessionModelAction.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date is in the past', async () => {
      const invalidDto: CreateAcademicSessionDto = {
        name: 'Past Start',
        startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Invalid)
        endDate: new Date(Date.now() + 172800000).toISOString(),
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException(sysMsg.START_DATE_IN_PAST),
      );
    });

    it('should throw BadRequestException if end date is in the past', async () => {
      const invalidDto: CreateAcademicSessionDto = {
        name: 'Past End',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Invalid)
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException(sysMsg.END_DATE_IN_PAST),
      );
    });

    it('should throw BadRequestException if end date is before or equal to start date', async () => {
      const startDate = new Date(Date.now() + 86400000);
      const invalidDto: CreateAcademicSessionDto = {
        name: 'Invalid Range',
        startDate: startDate.toISOString(),
        endDate: startDate.toISOString(), // Same as start date (Invalid)
      };

      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException(sysMsg.INVALID_DATE_RANGE),
      );
    });
  });

  // --- Placeholder Tests (Unchanged) ---
  describe('findAll', () => {
    const mockSessions: AcademicSession[] = [
      {
        id: '1',
        name: '2024/2025',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: '2025/2026',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: SessionStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPaginationMeta = {
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it('should return paginated academic sessions with default pagination', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: mockSessions,
        paginationMeta: mockPaginationMeta,
      });

      const result = await service.findAll();

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.ACADEMIC_SESSION_LIST_SUCCESS,
        data: mockSessions,
        meta: mockPaginationMeta,
      });
      expect(mockSessionModelAction.list).toHaveBeenCalledWith({
        order: { startDate: 'ASC' },
        paginationPayload: {
          page: 1,
          limit: 20,
        },
      });
    });

    it('should return paginated academic sessions with custom pagination', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: mockSessions.slice(0, 1),
        paginationMeta: { ...mockPaginationMeta, page: 2, limit: 1 },
      });

      const result = await service.findAll({ page: 2, limit: 1 });

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.ACADEMIC_SESSION_LIST_SUCCESS,
        data: mockSessions.slice(0, 1),
        meta: { ...mockPaginationMeta, page: 2, limit: 1 },
      });
      expect(mockSessionModelAction.list).toHaveBeenCalledWith({
        order: { startDate: 'ASC' },
        paginationPayload: {
          page: 2,
          limit: 1,
        },
      });
    });

    it('should normalize invalid page and limit values', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: mockSessions,
        paginationMeta: mockPaginationMeta,
      });

      await service.findAll({ page: -1, limit: 0 });

      expect(mockSessionModelAction.list).toHaveBeenCalledWith({
        order: { startDate: 'ASC' },
        paginationPayload: {
          page: 1,
          limit: 1,
        },
      });
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

  describe('AcademicSessionService.activeSessions', () => {
    let service: AcademicSessionService;
    let modelAction: jest.Mocked<AcademicSessionModelAction>;

    const mockMeta = { total: 1 };

    const makeSession = (
      overrides: Partial<AcademicSession>,
    ): AcademicSession => {
      return {
        id: overrides.id ?? '1',
        name: overrides.name ?? '2024 Session',
        startDate: overrides.startDate ?? new Date('2024-01-01'),
        endDate: overrides.endDate ?? new Date('2024-12-31'),
        status: overrides.status ?? SessionStatus.ACTIVE,
        createdAt: overrides.createdAt ?? new Date(),
        updatedAt: overrides.updatedAt ?? new Date(),
      };
    };

    beforeEach(async () => {
      // Mock DataSource - required by AcademicSessionService constructor
      const mockDataSource: Partial<DataSource> = {
        transaction: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AcademicSessionService,
          {
            provide: AcademicSessionModelAction,
            useValue: {
              list: jest.fn(),
            },
          },
          {
            provide: DataSource,
            useValue: mockDataSource,
          },
        ],
      }).compile();

      service = module.get(AcademicSessionService);
      modelAction = module.get(
        AcademicSessionModelAction,
      ) as jest.Mocked<AcademicSessionModelAction>;
    });

    test('returns null when no active sessions exist', async () => {
      modelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: mockMeta,
      });

      const result = await service.activeSessions();
      expect(result).toBeNull();
    });

    test('returns the single active session when exactly one exists', async () => {
      const session = makeSession({ id: '1' });

      modelAction.list.mockResolvedValue({
        payload: [session],
        paginationMeta: mockMeta,
      });

      const result = await service.activeSessions();
      expect(result).toEqual(session);
    });

    test('throws InternalServerErrorException when multiple active sessions exist', async () => {
      const s1 = makeSession({ id: '1' });
      const s2 = makeSession({ id: '2' });

      modelAction.list.mockResolvedValue({
        payload: [s1, s2],
        paginationMeta: mockMeta,
      });

      await expect(service.activeSessions()).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(service.activeSessions()).rejects.toThrow(
        sysMsg.MULTIPLE_ACTIVE_ACADEMIC_SESSION,
      );
    });
  });

  describe('AcademicSessionService - activeSessions', () => {
    let service: AcademicSessionService;
    let mockModelAction: jest.Mocked<AcademicSessionModelAction>;
    let mockDataSource: Partial<DataSource>;

    const makeSession = (
      overrides: Partial<AcademicSession> = {},
    ): AcademicSession => ({
      id: overrides.id ?? '1',
      name: overrides.name ?? '2024 Session',
      startDate: overrides.startDate ?? new Date('2024-01-01'),
      endDate: overrides.endDate ?? new Date('2024-12-31'),
      status: overrides.status ?? SessionStatus.ACTIVE,
      createdAt: overrides.createdAt ?? new Date(),
      updatedAt: overrides.updatedAt ?? new Date(),
    });

    beforeEach(async () => {
      const mockModelActionProvider: Partial<AcademicSessionModelAction> = {
        list: jest.fn(),
      };

      // Mock DataSource.transaction
      mockDataSource = {
        transaction: jest
          .fn()
          .mockImplementation(
            async <T>(
              callback: (manager: EntityManager) => Promise<T>,
            ): Promise<T> => {
              const mockManager = {
                update: jest.fn(),
                findOne: jest.fn(),
              } as unknown as EntityManager;
              return callback(mockManager);
            },
          ),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AcademicSessionService,
          {
            provide: AcademicSessionModelAction,
            useValue: mockModelActionProvider,
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      service = module.get(AcademicSessionService);
      mockModelAction = module.get(
        AcademicSessionModelAction,
      ) as jest.Mocked<AcademicSessionModelAction>;
    });

    it('returns null when no active sessions exist', async () => {
      mockModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });
      const result = await service.activeSessions();
      expect(result).toBeNull();
      expect(mockModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: { status: SessionStatus.ACTIVE },
      });
    });

    it('returns the single active session when exactly one exists', async () => {
      const session = makeSession({ id: '1' });
      mockModelAction.list.mockResolvedValue({
        payload: [session],
        paginationMeta: { total: 1 },
      });
      const result = await service.activeSessions();
      expect(result).toEqual(session);
    });

    it('throws InternalServerErrorException when multiple active sessions exist', async () => {
      const s1 = makeSession({ id: '1' });
      const s2 = makeSession({ id: '2' });
      mockModelAction.list.mockResolvedValue({
        payload: [s1, s2],
        paginationMeta: { total: 2 },
      });

      await expect(service.activeSessions()).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.activeSessions()).rejects.toThrow(
        sysMsg.MULTIPLE_ACTIVE_ACADEMIC_SESSION,
      );
    });
  });
  describe('AcademicSessionService - activateSession (with auto-linking)', () => {
    let service: AcademicSessionService;
    let mockSessionModelAction: jest.Mocked<AcademicSessionModelAction>;
    let mockClassModelAction: any;
    let mockSessionClassModelAction: any;
    let mockDataSource: any;
    let mockTransactionManager: Partial<EntityManager>;

    const session_id = '123e4567-e89b-12d3-a456-426614174000';
    const mockInactiveSession: AcademicSession = {
      id: session_id,
      name: '2024/2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      status: SessionStatus.INACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockActiveSession: AcademicSession = {
      ...mockInactiveSession,
      status: SessionStatus.ACTIVE,
    };

    const mockClasses = [
      { id: 'class-1', name: 'Grade 10', stream: 'Science' },
      { id: 'class-2', name: 'Grade 11', stream: 'Arts' },
      { id: 'class-3', name: 'Grade 12', stream: 'Commerce' },
    ];

    beforeEach(async () => {
      // Mock transaction manager
      mockTransactionManager = {};

      // Mock DataSource with transaction
      mockDataSource = {
        transaction: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTransactionManager);
        }),
      };

      // Mock SessionModelAction
      mockSessionModelAction = {
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      } as unknown as jest.Mocked<AcademicSessionModelAction>;

      // Mock ClassModelAction
      mockClassModelAction = {
        list: jest.fn(),
      };

      // Mock SessionClassModelAction
      mockSessionClassModelAction = {
        create: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AcademicSessionService,
          {
            provide: AcademicSessionModelAction,
            useValue: mockSessionModelAction,
          },
          {
            provide: 'ClassModelAction',
            useValue: mockClassModelAction,
          },
          {
            provide: 'SessionClassModelAction',
            useValue: mockSessionClassModelAction,
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      service = module.get<AcademicSessionService>(AcademicSessionService);
      // Manually inject dependencies (since they use @Inject decorator)
      (service as any).classModelAction = mockClassModelAction;
      (service as any).sessionClassModelAction = mockSessionClassModelAction;
    });

    it('should activate session and auto-link all classes successfully', async () => {
      // Setup mocks
      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockClassModelAction.list.mockResolvedValue({
        payload: mockClasses,
        paginationMeta: { total: 3 },
      });
      mockSessionClassModelAction.create.mockResolvedValue({});

      const result = await service.activateSession({
        session_id: session_id,
      });

      // Assertions
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.ACADEMIC_SESSION_ACTIVATED,
        data: {
          session: mockActiveSession,
          classes_linked: 3,
        },
      });

      // Verify session validation
      expect(mockSessionModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: session_id },
      });

      // Verify activation
      expect(mockSessionModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: session_id },
        updatePayload: { status: SessionStatus.ACTIVE },
        transactionOptions: {
          useTransaction: true,
          transaction: mockTransactionManager,
        },
      });

      // Verify all classes were linked
      expect(mockClassModelAction.list).toHaveBeenCalledWith({});
      expect(mockSessionClassModelAction.create).toHaveBeenCalledTimes(3);
      mockClasses.forEach((cls, index) => {
        expect(mockSessionClassModelAction.create).toHaveBeenNthCalledWith(
          index + 1,
          {
            createPayload: {
              session_id: session_id,
              class_id: cls.id,
            },
            transactionOptions: {
              useTransaction: true,
              transaction: mockTransactionManager,
            },
          },
        );
      });
    });

    it('should throw NotFoundException if session does not exist', async () => {
      mockSessionModelAction.get.mockResolvedValue(null);

      await expect(
        service.activateSession({ session_id: session_id }),
      ).rejects.toThrow(sysMsg.ACADEMIC_SESSION_NOT_FOUND);

      expect(mockSessionModelAction.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if session is already active', async () => {
      mockSessionModelAction.get.mockResolvedValue(mockActiveSession);

      await expect(
        service.activateSession({ session_id: session_id }),
      ).rejects.toThrow(sysMsg.ACADEMIC_SESSION_ALREADY_ACTIVE);

      expect(mockSessionModelAction.update).not.toHaveBeenCalled();
    });

    it('should deactivate previous active session before activating new one', async () => {
      const previousActiveSession: AcademicSession = {
        id: 'prev-session-id',
        name: '2023/2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list
        .mockResolvedValueOnce({
          payload: [previousActiveSession],
          paginationMeta: { total: 1 },
        })
        .mockResolvedValueOnce({
          payload: [],
          paginationMeta: { total: 0 },
        });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockClassModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });

      await service.activateSession({ session_id: session_id });

      // Verify previous session was deactivated
      expect(mockSessionModelAction.update).toHaveBeenNthCalledWith(1, {
        identifierOptions: { id: previousActiveSession.id },
        updatePayload: { status: SessionStatus.INACTIVE },
        transactionOptions: {
          useTransaction: true,
          transaction: mockTransactionManager,
        },
      });

      // Verify new session was activated
      expect(mockSessionModelAction.update).toHaveBeenNthCalledWith(2, {
        identifierOptions: { id: session_id },
        updatePayload: { status: SessionStatus.ACTIVE },
        transactionOptions: {
          useTransaction: true,
          transaction: mockTransactionManager,
        },
      });
    });

    it('should remove links from previous active session', async () => {
      const previousActiveSession: AcademicSession = {
        id: 'prev-session-id',
        name: '2023/2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        status: SessionStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const previousLinks = [
        {
          id: 'link-1',
          session_id: 'prev-session-id',
          class_id: 'class-1',
          deleted_at: null,
        },
        {
          id: 'link-2',
          session_id: 'prev-session-id',
          class_id: 'class-2',
          deleted_at: null,
        },
      ];

      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list.mockResolvedValue({
        payload: [previousActiveSession],
        paginationMeta: { total: 1 },
      });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockSessionClassModelAction.list.mockResolvedValue({
        payload: previousLinks,
        paginationMeta: { total: 2 },
      });
      mockSessionClassModelAction.update.mockResolvedValue({});
      mockClassModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });

      await service.activateSession({ session_id: session_id });

      // Verify previous links were soft-deleted
      expect(mockSessionClassModelAction.list).toHaveBeenCalledWith({
        filterRecordOptions: {
          session_id: previousActiveSession.id,
          deleted_at: null,
        },
      });
      expect(mockSessionClassModelAction.update).toHaveBeenCalledTimes(2);
      previousLinks.forEach((link, index) => {
        expect(mockSessionClassModelAction.update).toHaveBeenNthCalledWith(
          index + 1,
          {
            identifierOptions: { id: link.id },
            updatePayload: { deleted_at: expect.any(Date) },
            transactionOptions: {
              useTransaction: true,
              transaction: mockTransactionManager,
            },
          },
        );
      });
    });

    it('should handle duplicate class linking gracefully (unique constraint)', async () => {
      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockClassModelAction.list.mockResolvedValue({
        payload: mockClasses,
        paginationMeta: { total: 3 },
      });

      // Simulate unique constraint violation on second class
      mockSessionClassModelAction.create
        .mockResolvedValueOnce({}) // First class succeeds
        .mockRejectedValueOnce({ code: '23505' }) // Second class - duplicate
        .mockResolvedValueOnce({}); // Third class succeeds

      const result = await service.activateSession({
        session_id: session_id,
      });

      expect(result.data.classes_linked).toBe(2); // Only 2 linked (1 duplicate skipped)
    });

    it('should rollback transaction if class linking fails with non-duplicate error', async () => {
      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockClassModelAction.list.mockResolvedValue({
        payload: mockClasses,
        paginationMeta: { total: 3 },
      });

      // Simulate non-duplicate error
      const dbError = new Error('Database connection lost');
      (dbError as any).code = 'CONNECTION_ERROR';
      mockSessionClassModelAction.create
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(dbError);

      await expect(
        service.activateSession({ session_id: session_id }),
      ).rejects.toThrow('Database connection lost');
    });

    it('should activate session even when no classes exist', async () => {
      mockSessionModelAction.get.mockResolvedValue(mockInactiveSession);
      mockSessionModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });
      mockSessionModelAction.update.mockResolvedValue(mockActiveSession);
      mockClassModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });

      const result = await service.activateSession({
        session_id: session_id,
      });

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.ACADEMIC_SESSION_ACTIVATED,
        data: {
          session: mockActiveSession,
          classes_linked: 0,
        },
      });
      expect(mockSessionClassModelAction.create).not.toHaveBeenCalled();
    });
  });

  describe('AcademicSessionService - linkClassesToActiveSession', () => {
    let service: AcademicSessionService;
    let mockSessionModelAction: jest.Mocked<AcademicSessionModelAction>;
    let mockClassModelAction: any;
    let mockSessionClassModelAction: any;
    let mockDataSource: any;
    let mockTransactionManager: Partial<EntityManager>;

    const mockActiveSession: AcademicSession = {
      id: 'active-session-id',
      name: '2024/2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockClasses = [
      { id: 'class-1', name: 'Grade 10' },
      { id: 'class-2', name: 'Grade 11' },
    ];

    beforeEach(async () => {
      mockTransactionManager = {};

      mockDataSource = {
        transaction: jest.fn().mockImplementation(async (callback) => {
          return callback(mockTransactionManager);
        }),
      };

      mockSessionModelAction = {
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      } as unknown as jest.Mocked<AcademicSessionModelAction>;

      mockClassModelAction = {
        list: jest.fn(),
      };

      mockSessionClassModelAction = {
        create: jest.fn(),
        list: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AcademicSessionService,
          {
            provide: AcademicSessionModelAction,
            useValue: mockSessionModelAction,
          },
          {
            provide: 'ClassModelAction',
            useValue: mockClassModelAction,
          },
          {
            provide: 'SessionClassModelAction',
            useValue: mockSessionClassModelAction,
          },
          { provide: DataSource, useValue: mockDataSource },
        ],
      }).compile();

      service = module.get<AcademicSessionService>(AcademicSessionService);
      (service as any).classModelAction = mockClassModelAction;
      (service as any).sessionClassModelAction = mockSessionClassModelAction;
    });

    it('should link all classes to active session successfully', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: [mockActiveSession],
        paginationMeta: { total: 1 },
      });
      mockClassModelAction.list.mockResolvedValue({
        payload: mockClasses,
        paginationMeta: { total: 2 },
      });
      mockSessionClassModelAction.create.mockResolvedValue({});

      const result = await service.linkClassesToActiveSession();

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Classes linked to active session successfully',
        data: {
          session_id: mockActiveSession.id,
          session_name: mockActiveSession.name,
          classes_linked: 2,
        },
      });

      expect(mockSessionClassModelAction.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if no active session exists', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });

      await expect(service.linkClassesToActiveSession()).rejects.toThrow(
        sysMsg.NO_ACTIVE_ACADEMIC_SESSION,
      );

      expect(mockClassModelAction.list).not.toHaveBeenCalled();
    });

    it('should handle case when no classes exist', async () => {
      mockSessionModelAction.list.mockResolvedValue({
        payload: [mockActiveSession],
        paginationMeta: { total: 1 },
      });
      mockClassModelAction.list.mockResolvedValue({
        payload: [],
        paginationMeta: { total: 0 },
      });

      const result = await service.linkClassesToActiveSession();

      expect(result.data.classes_linked).toBe(0);
      expect(mockSessionClassModelAction.create).not.toHaveBeenCalled();
    });
  });
});
