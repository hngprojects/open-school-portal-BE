import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { SuperAdmin } from './entities/superadmin.entity';
import { SuperadminModelAction } from './model-actions/superadmin-actions';
import { SuperadminService } from './superadmin.service';

describe('SuperadminService', () => {
  let service: SuperadminService;
  let modelAction: jest.Mocked<Partial<SuperadminModelAction>>;

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockModelActionImpl = {
    get: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperadminService,
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
    modelAction = module.get(SuperadminModelAction) as unknown;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSuperAdmin', () => {
    const dto: CreateSuperadminDto = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      confirm_password: 'password123',
      phoneNumber: '08000000000',
      // schoolName is optional in dto - omit to test isActive=false flow
    } as unknown as CreateSuperadminDto;

    it('should create a superadmin and return created data (without password)', async () => {
      // modelAction.get should indicate no existing record
      modelAction.get.mockReturnValue(null);

      // stub bcrypt.hash to avoid slow real hashing
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw');

      // transaction should call provided callback and return its result
      mockDataSource.transaction.mockImplementation(async (cb: unknown) => {
        // pass a fake manager to the callback
        const result = await cb({} as unknown);
        return result;
      });

      const createdEntity: Partial<SuperAdmin> = {
        id: 'uuid-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: 'hashed_pw',
        isActive: false,
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
      expect((result.data as unknown).password).toBeUndefined();
    });

    it('should throw ConflictException when passwords are not provided', async () => {
      const badDto = {
        ...dto,
        password: undefined,
        confirm_password: undefined,
      } as unknown;

      await expect(service.createSuperAdmin(badDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      // simulate existing record (note: service does not await get in source; returning a truthy value works)
      modelAction.get.mockReturnValue({ id: 'existing-id' });

      await expect(service.createSuperAdmin(dto)).rejects.toThrow(
        ConflictException,
      );

      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { email: dto.email },
      });
    });
  });
});
