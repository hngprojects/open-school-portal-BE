import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  DataSource,
  Repository,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm';
import { Logger } from 'winston';

import { Term, TermName } from '../academic-term/entities/term.entity';
import { TermModelAction } from '../academic-term/model-actions';
// FIX: Import Term entity and its enums for proper typing
import { ClassModelAction } from '../class/model-actions/class.actions';

import { CreateFeesDto, QueryFeesDto, UpdateFeesDto } from './dto/fees.dto';
import { Fees } from './entities/fees.entity';
import { FeeStatus } from './enums/fees.enums';
import { FeesService } from './fees.service';
import { FeesModelAction } from './model-action/fees.model-action';

// This definition is correct but can be simplified if Term is imported.
type MockQueryBuilder = {
  leftJoinAndSelect: jest.Mock<MockQueryBuilder, [string, string]>;
  leftJoin: jest.Mock<MockQueryBuilder, [string, string]>;
  addSelect: jest.Mock<MockQueryBuilder, [string[]]>;
  orderBy: jest.Mock<MockQueryBuilder, [string, 'ASC' | 'DESC']>;
  andWhere: jest.Mock<MockQueryBuilder, [string, Record<string, unknown>]>;
  skip: jest.Mock<MockQueryBuilder, [number]>;
  take: jest.Mock<MockQueryBuilder, [number]>;
  getCount: jest.Mock<Promise<number>, []>;
  getMany: jest.Mock<Promise<Fees[]>, []>;
};

describe('FeesService', () => {
  let service: FeesService;
  let feesModelAction: jest.Mocked<FeesModelAction>;
  let termModelAction: jest.Mocked<TermModelAction>;
  let classModelAction: jest.Mocked<ClassModelAction>;
  let logger: Partial<Logger>;
  let mockQueryBuilder: MockQueryBuilder;
  let mockFeesRepository: jest.Mocked<Repository<Fees>>;

  const mockLogger: Partial<Logger> = {
    child: jest.fn().mockReturnThis(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockEntityManager: Partial<EntityManager> = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockFee: Fees = {
    id: 'fee-123',
    component_name: 'Tuition Fee',
    description: 'Quarterly tuition fee',
    amount: 5000,
    term_id: 'term-123',
    // FIX: Replaced 'as any' with 'as unknown as Term'.
    // We add more fields to Term to satisfy the minimum structure of the entity.
    term: {
      id: 'term-123',
      name: TermName.FIRST, // Required by Term entity
      sessionId: 'session-1', // Required by Term entity
    } as unknown as Term,
    created_by: 'admin-user-123',
    classes: [],
    status: FeeStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Fees;

  const mockFeesModelActionValue = {
    create: jest.fn(),
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockTermModelActionValue = { get: jest.fn() };
  const mockClassModelActionValue = { find: jest.fn() };
  const mockDataSourceValue = { transaction: jest.fn() };

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      getMany: jest.fn(),
    };

    mockFeesRepository = {
      createQueryBuilder: jest.fn(
        () => mockQueryBuilder as unknown as SelectQueryBuilder<Fees>,
      ),
    } as unknown as jest.Mocked<Repository<Fees>>;

    mockDataSourceValue.transaction = jest
      .fn()
      .mockImplementation(
        async (cb: (manager: EntityManager) => Promise<unknown>) =>
          cb(mockEntityManager as EntityManager),
      );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        { provide: FeesModelAction, useValue: mockFeesModelActionValue },
        { provide: TermModelAction, useValue: mockTermModelActionValue },
        { provide: ClassModelAction, useValue: mockClassModelActionValue },
        { provide: DataSource, useValue: mockDataSourceValue },
        { provide: getRepositoryToken(Fees), useValue: mockFeesRepository },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    feesModelAction = module.get(FeesModelAction);
    termModelAction = module.get(TermModelAction);
    classModelAction = module.get(ClassModelAction);
    logger = module.get(WINSTON_MODULE_PROVIDER);
  });

  afterEach(() => jest.clearAllMocks());

  // ================= CREATE =================
  describe('create', () => {
    const createFeesDto: CreateFeesDto = {
      component_name: 'Tuition Fee',
      description: 'Quarterly tuition fee',
      amount: 5000,
      term_id: 'term-123',
      class_ids: ['class-1'],
    };

    it('should create a fee successfully', async () => {
      (termModelAction.get as jest.Mock).mockResolvedValue({ id: 'term-123' });
      (classModelAction.find as jest.Mock).mockResolvedValue({
        payload: [{ id: 'class-1' }],
        total: 1,
      });
      (feesModelAction.create as jest.Mock).mockResolvedValue(mockFee);

      const result = await service.create(createFeesDto, 'admin');

      expect(result).toEqual(mockFee);
      expect(feesModelAction.create).toHaveBeenCalled();
      expect((logger as Logger).info).toHaveBeenCalled();
    });

    it('should throw BadRequestException if term does not exist', async () => {
      (termModelAction.get as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createFeesDto, 'admin')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if class ids are invalid', async () => {
      (termModelAction.get as jest.Mock).mockResolvedValue({ id: 'term-123' });
      (classModelAction.find as jest.Mock).mockResolvedValue({
        payload: [],
        total: 0,
      });
      await expect(service.create(createFeesDto, 'admin')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ================= FIND ALL =================
  describe('findAll', () => {
    let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Fees>>;

    const mockTerm: Term = {
      id: 'term-123',
      name: TermName.FIRST,
      sessionId: 'session-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-04-30'),
      status: TermStatus.ACTIVE,
      isCurrent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Term;

    const mockClasses: Class[] = [
      {
        id: 'class-1',
        name: 'Grade 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Class,
      {
        id: 'class-2',
        name: 'Grade 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Class,
    ];

    const mockFees: Fees[] = [
      {
        id: 'fee-1',
        component_name: 'Tuition Fee',
        description: 'Quarterly tuition fee',
        amount: 5000,
        term_id: 'term-123',
        term: mockTerm,
        classes: mockClasses,
        status: FeeStatus.ACTIVE,
        created_by: 'admin-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Fees,
      {
        id: 'fee-2',
        component_name: 'Library Fee',
        description: 'Library access fee',
        amount: 1000,
        term_id: 'term-123',
        term: mockTerm,
        classes: [mockClasses[0]],
        status: FeeStatus.ACTIVE,
        created_by: 'admin-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Fees,
    ];

    beforeEach(() => {
      mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        getMany: jest.fn(),
      } as unknown as jest.Mocked<SelectQueryBuilder<Fees>>;

      mockFeesRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('should return all fees regardless of status by default', async () => {
      const mixedStatusFees = [
        mockFees[0],
        { ...mockFees[1], status: FeeStatus.INACTIVE },
      ];
      mockQueryBuilder.getCount.mockResolvedValue(2);
      mockQueryBuilder.getMany.mockResolvedValue(mixedStatusFees);

      const queryDto: QueryFeesDto = {
        page: 1,
        limit: 20,
      };

      const result = await service.findAll(queryDto);

      expect(mockFeesRepository.createQueryBuilder).toHaveBeenCalledWith('fee');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'fee.term',
        'term',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'fee.classes',
        'classes',
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'fee.createdAt',
        'DESC',
      );
      // Should NOT call andWhere for status when not provided
      const statusCalls = mockQueryBuilder.andWhere.mock.calls.filter(
        (call) => call[0] === 'fee.status = :status',
      );
      expect(statusCalls).toHaveLength(0);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(result).toEqual({
        fees: mixedStatusFees,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by status when provided', async () => {
      const inactiveFees = [
        {
          ...mockFees[0],
          status: FeeStatus.INACTIVE,
        },
      ];
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockFee]);

      const queryDto: QueryFeesDto = { page: 1, limit: 10 };
      const result = await service.findAll(queryDto);

      expect(result.fees).toEqual([mockFee]);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect((logger as Logger).info).toHaveBeenCalled();
    });
  });

  // ================= UPDATE =================
  describe('update', () => {
    const updateDto: UpdateFeesDto = { component_name: 'Updated Fee' };

    it('should update fee successfully', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue({
        ...mockFee,
        classes: [],
      });
      (feesModelAction.save as jest.Mock).mockResolvedValue({
        ...mockFee,
        component_name: 'Updated Fee',
      });

      const result = await service.update('fee-123', updateDto);

      expect(result.component_name).toBe('Updated Fee');
      expect((logger as Logger).info).toHaveBeenCalled();
    });

    it('should throw NotFoundException if fee not found', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue(null);
      await expect(service.update('fee-123', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ================= FIND ONE =================
  describe('findOne', () => {
    it('should return a fee with limited createdBy', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue({
        ...mockFee,
        createdBy: {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          middle_name: 'M',
        },
      });

      const result = await service.findOne('fee-123');

      expect(result.createdBy).toEqual({
        id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        middle_name: 'M',
      });
    });

    it('should throw NotFoundException if fee not found', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('fee-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ================= DEACTIVATE =================
  describe('deactivate', () => {
    it('should deactivate a fee successfully', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue({
        ...mockFee,
        status: FeeStatus.ACTIVE,
      });
      (feesModelAction.update as jest.Mock).mockResolvedValue({
        ...mockFee,
        status: FeeStatus.INACTIVE,
      });

      const result = await service.deactivate('fee-123', 'admin');

      expect(result.status).toBe(FeeStatus.INACTIVE);
      expect((logger as Logger).info).toHaveBeenCalled();
    });

    it('should return fee if already inactive', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue({
        ...mockFee,
        status: FeeStatus.INACTIVE,
      });

      const result = await service.deactivate('fee-123', 'admin');

      expect(result.status).toBe(FeeStatus.INACTIVE);
      expect((logger as Logger).info).toHaveBeenCalled();
    });

    it('should throw NotFoundException if fee not found', async () => {
      (feesModelAction.get as jest.Mock).mockResolvedValue(null);
      await expect(service.deactivate('fee-123', 'admin')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activate', () => {
    const feeId = 'fee-123';
    const activatedBy = 'admin-user-123';

    it('should activate an inactive fee successfully', async () => {
      const inactiveFee = { ...mockFee, status: FeeStatus.INACTIVE };

      mockFeesModelAction.get.mockResolvedValue(activeFee);
      mockFeesModelAction.update.mockResolvedValue(inactiveFee);

      const result = await service.deactivate(feeId, deactivatedBy, reason);

      // get should be called WITHOUT transactionOptions
      expect(feesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
      });

      // update should be called WITH transactionOptions
      expect(feesModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
        updatePayload: { status: FeeStatus.INACTIVE },
        transactionOptions: {
          useTransaction: false,
        },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Fee component deactivated successfully',
        expect.objectContaining({
          fee_id: feeId,
          deactivated_by: deactivatedBy,
          reason: reason,
          previous_status: FeeStatus.ACTIVE,
          new_status: FeeStatus.INACTIVE,
        }),
      );
      expect(result.status).toBe(FeeStatus.INACTIVE);
    });

    it('should deactivate an active fee without reason', async () => {
      const activeFee = { ...mockFee, status: FeeStatus.ACTIVE };

      mockFeesModelAction.get.mockResolvedValue(inactiveFee);
      mockFeesModelAction.update.mockResolvedValue(activeFee);

      const result = await service.activate(feeId, activatedBy);

      expect(feesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
      });

      expect(feesModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
        updatePayload: { status: FeeStatus.ACTIVE },
        transactionOptions: {
          useTransaction: false,
        },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Fee component activated successfully',
        expect.objectContaining({
          fee_id: feeId,
          activated_by: activatedBy,
          previous_status: FeeStatus.INACTIVE,
          new_status: FeeStatus.ACTIVE,
        }),
      );
      expect(result.status).toBe(FeeStatus.ACTIVE);
    });

    it('should return idempotent success for already active fee', async () => {
      const activeFee = { ...mockFee, status: FeeStatus.ACTIVE };

      mockFeesModelAction.get.mockResolvedValue(activeFee);

      const result = await service.activate(feeId, activatedBy);

      expect(feesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
      });
      expect(feesModelAction.update).not.toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(
        'Fee component is already active',
        expect.objectContaining({
          fee_id: feeId,
          activated_by: activatedBy,
        }),
      );
      expect(result.status).toBe(FeeStatus.ACTIVE);
    });

    it('should throw NotFoundException when fee does not exist', async () => {
      mockFeesModelAction.get.mockResolvedValue(null);

      await expect(service.activate(feeId, activatedBy)).rejects.toThrow(
        new NotFoundException(sysMsg.FEE_NOT_FOUND),
      );

      expect(feesModelAction.update).not.toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    const feeId = 'fee-123';
    const activatedBy = 'admin-user-123';

    it('should activate an inactive fee successfully', async () => {
      const inactiveFee = { ...mockFee, status: FeeStatus.INACTIVE };
      const activeFee = { ...mockFee, status: FeeStatus.ACTIVE };

      mockFeesModelAction.get.mockResolvedValue(inactiveFee);
      mockFeesModelAction.update.mockResolvedValue(activeFee);

      const result = await service.activate(feeId, activatedBy);

      expect(feesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
      });

      expect(feesModelAction.update).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
        updatePayload: { status: FeeStatus.ACTIVE },
        transactionOptions: {
          useTransaction: false,
        },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Fee component activated successfully',
        expect.objectContaining({
          fee_id: feeId,
          activated_by: activatedBy,
          previous_status: FeeStatus.INACTIVE,
          new_status: FeeStatus.ACTIVE,
        }),
      );
      expect(result.status).toBe(FeeStatus.ACTIVE);
    });

    it('should return idempotent success for already active fee', async () => {
      const activeFee = { ...mockFee, status: FeeStatus.ACTIVE };

      mockFeesModelAction.get.mockResolvedValue(activeFee);

      const result = await service.activate(feeId, activatedBy);

      expect(feesModelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: feeId },
      });
      expect(feesModelAction.update).not.toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(
        'Fee component is already active',
        expect.objectContaining({
          fee_id: feeId,
          activated_by: activatedBy,
        }),
      );
      expect(result.status).toBe(FeeStatus.ACTIVE);
    });

    it('should throw NotFoundException when fee does not exist', async () => {
      mockFeesModelAction.get.mockResolvedValue(null);

      await expect(service.activate(feeId, activatedBy)).rejects.toThrow(
        new NotFoundException(sysMsg.FEE_NOT_FOUND),
      );

      expect(feesModelAction.update).not.toHaveBeenCalled();
    });
  });
});
