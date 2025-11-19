import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../constants/system.messages';

import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

describe('WaitlistController', () => {
  let controller: WaitlistController;
  let service: Partial<Record<keyof WaitlistService, jest.Mock>>;

  const mockDate = new Date();
  const mockWaitlistEntry = {
    id: 'uuid-123',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    createdAt: mockDate,
  } as Waitlist;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistController],
      providers: [
        {
          provide: WaitlistService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WaitlistController>(WaitlistController);
    service = module.get(WaitlistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return formatted snake_case response', async () => {
      const createDto: CreateWaitlistDto = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      service.create.mockResolvedValue(mockWaitlistEntry);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: sysMsg.WAITLIST_ADDED_SUCCESSFULLY,
        data: {
          id: mockWaitlistEntry.id,
          first_name: mockWaitlistEntry.first_name,
          last_name: mockWaitlistEntry.last_name,
          email: mockWaitlistEntry.email,
          created_at: mockDate,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all entries formatted correctly', async () => {
      service.findAll.mockResolvedValue([mockWaitlistEntry]);

      const result = await controller.findAll();

      expect(result.data[0]).toHaveProperty('first_name', 'John');
      expect(result.data[0]).toHaveProperty('created_at', mockDate);
      expect(result.message).toBe(sysMsg.WAITLIST_RETRIEVED_SUCCESSFULLY);
    });
  });

  describe('findOne', () => {
    it('should return a specific entry', async () => {
      service.findOne.mockResolvedValue(mockWaitlistEntry);

      const result = await controller.findOne('uuid-123');

      expect(result.data.id).toBe('uuid-123');
      expect(result.message).toBe(sysMsg.OPERATION_SUCCESSFUL);
    });

    it('should propagate NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove an entry and return null data', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('uuid-123');

      expect(service.remove).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: sysMsg.OPERATION_SUCCESSFUL,
        data: null,
      });
    });
  });
});
