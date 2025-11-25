import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { SuperAdmin } from './entities/superadmin.entity';
import { SuperadminModelAction } from './model-actions/superadmin-actions';
import { SuperadminService } from './superadmin.service';

describe('SuperadminService', () => {
  let service: SuperadminService;
  type MockSuperadminModelAction = {
    get: jest.Mock<Promise<SuperAdmin | null>, unknown[]>;
    create: jest.Mock<Promise<SuperAdmin>, unknown[]>;
  };
  let modelAction: MockSuperadminModelAction;

  const mockDataSource: { transaction: jest.Mock } = {
    transaction: jest.fn(),
  };

  const mockModelActionImpl: MockSuperadminModelAction = {
    get: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperadminService,
        // provide the repository token because the service class has an @InjectRepository decorator
        {
          provide: getRepositoryToken(SuperAdmin),
          useValue: {},
        },
        {
          provide: SuperadminModelAction,
          useValue: mockModelActionImpl,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SuperadminService>(SuperadminService);
    modelAction = module.get(
      SuperadminModelAction,
    ) as unknown as MockSuperadminModelAction;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // Reset mock implementations before each test
  const resetMocks = () => {
    mockModelActionImpl.get.mockReset();
    mockModelActionImpl.create.mockReset();
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSuperAdmin', () => {
    const dtoInput: Partial<CreateSuperadminDto> = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      confirm_password: 'password123',
      // schoolName is optional in dto - omit to test isActive=false flow
    };
    const dto = dtoInput as unknown as CreateSuperadminDto;

    it('should create a superadmin and return created data (with password provided)', async () => {
      resetMocks();
      // modelAction.get should indicate no existing record
      modelAction.get.mockResolvedValue(null);

      // stub bcrypt.hash to avoid slow real hashing (strongly-typed spy)
      const hashSpy = jest.spyOn(bcrypt, 'hash') as unknown as jest.SpyInstance<
        Promise<string>,
        [string, number | string]
      >;
      hashSpy.mockResolvedValue('hashed_pw');

      // transaction should call provided callback and return its result
      mockDataSource.transaction.mockImplementation(
        async (cb: (manager: Record<string, unknown>) => Promise<unknown>) => {
          // pass a fake manager to the callback
          const result = await cb({} as Record<string, unknown>);
          return result;
        },
      );

      const createdEntity: SuperAdmin = {
        id: 'uuid-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: 'hashed_pw',
        schoolName: 'The Bells University',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      modelAction.create.mockResolvedValue(createdEntity);

      const result = await service.createSuperAdmin(dto);

      // ensure get was called to check uniqueness
      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { email: dto.email },
      });

      // ensure create was called with hashed password and isActive false
      expect(modelAction.create).toHaveBeenCalledWith({
        createPayload: expect.objectContaining({
          email: dto.email,
          password: 'hashed_pw',
          isActive: false,
          firstName: dto.firstName,
          lastName: dto.lastName,
        }),
        transactionOptions: {
          useTransaction: true,
          transaction: expect.any(Object),
        },
      });

      expect(result).toHaveProperty(
        'message',
        sysMsg.SUPERADMIN_ACCOUNT_CREATED,
      );
      expect(result).toHaveProperty('status_code');
      expect(result).toHaveProperty('data');
      // password must be removed from returned data
      expect((result.data as Partial<SuperAdmin>).password).toBeUndefined();
    });

    it('should throw ConflictException when passwords are not provided', async () => {
      resetMocks();
      const badDto = {
        ...dtoInput,
        password: undefined,
        confirm_password: undefined,
      } as unknown as CreateSuperadminDto;

      await expect(service.createSuperAdmin(badDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      resetMocks();
      // simulate existing record
      const existingSuperAdmin: SuperAdmin = {
        id: 'existing-id',
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@example.com',
        schoolName: 'Existing School',
        password: 'pw',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      modelAction.get.mockResolvedValue(existingSuperAdmin);

      await expect(service.createSuperAdmin(dto)).rejects.toThrow(
        ConflictException,
      );

      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { email: dto.email },
      });
    });
  });
});
