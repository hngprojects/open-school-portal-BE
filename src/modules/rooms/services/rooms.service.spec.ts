import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { RoomModelAction } from '../model-actions/room.actions';

import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: RoomModelAction,
          useValue: {
            get: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) =>
              cb({
                // Mock manager if needed within the transaction callback
              }),
            ),
          },
        },
        {
          provide: 'winston',
          useValue: {
            log: jest.fn(),
            child: jest.fn().mockReturnThis(), // Mock the child method to return a logger-like object
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
