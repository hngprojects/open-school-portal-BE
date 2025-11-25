import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';

describe('SuperadminController', () => {
  let controller: SuperadminController;
  let service: jest.Mocked<Partial<SuperadminService>>;

  const mockService = {
    createSuperAdmin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperadminController],
      providers: [
        {
          provide: SuperadminService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SuperadminController>(SuperadminController);
    service = module.get(SuperadminService) as unknown;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateSuperadminDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'pass1234',
      confirm_password: 'pass1234',
    } as unknown as CreateSuperadminDto;

    it('should call service.createSuperAdmin and return its result', async () => {
      const serviceResult = {
        message: sysMsg.SUPERADMIN_ACCOUNT_CREATED,
        status_code: 201,
        data: { id: 'uuid-1', email: dto.email },
      };

      mockService.createSuperAdmin.mockResolvedValue(serviceResult);

      const result = await controller.create(dto);

      expect(service.createSuperAdmin).toHaveBeenCalledWith(dto);
      expect(result).toEqual(serviceResult);
    });

    it('should propagate errors from the service', async () => {
      mockService.createSuperAdmin.mockRejectedValue(
        new ConflictException('boom'),
      );

      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
  });
});
