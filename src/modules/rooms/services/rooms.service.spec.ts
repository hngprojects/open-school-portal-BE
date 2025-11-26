import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, ILike } from 'typeorm';

import * as sysMsg from '../../../constants/system.messages';
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
            repository: {
              createQueryBuilder: jest.fn(),
            },
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) =>
              cb({
                // mocked transaction manager
              }),
            ),
          },
        },
        {
          provide: 'winston',
          useValue: {
            log: jest.fn(),
            child: jest.fn().mockReturnValue({
              info: jest.fn(),
              error: jest.fn(),
              warn: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createRoomDto = {
      name: 'Test Room',
      capacity: 10,
      location: 'Building A',
      floor: '1st Floor',
      room_type: 'Classroom',
      description: 'A room for testing purposes',
    };

    const newRoom = {
      id: '1',
      ...createRoomDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully create a new room', async () => {
      jest.spyOn(service['roomModelAction'], 'get').mockResolvedValue(null);
      jest
        .spyOn(service['roomModelAction'], 'create')
        .mockResolvedValue(newRoom);

      const result = await service.create(createRoomDto);

      expect(service['roomModelAction'].get).toHaveBeenCalledWith({
        identifierOptions: { name: ILike(createRoomDto.name) },
      });

      expect(service['roomModelAction'].create).toHaveBeenCalledWith({
        createPayload: {
          name: createRoomDto.name,
          capacity: createRoomDto.capacity,
          location: createRoomDto.location,
          floor: createRoomDto.floor,
          room_type: createRoomDto.room_type,
          description: createRoomDto.description,
          // ⛔ timestamps NOT expected here
        },
        transactionOptions: {
          useTransaction: true,
          transaction: {},
        },
      });

      expect(result.status_code).toBe(201);
      expect(result.message).toBe(sysMsg.ROOM_CREATED);

      expect(result.data).toEqual(
        expect.objectContaining({
          name: createRoomDto.name,
          capacity: createRoomDto.capacity,
          location: createRoomDto.location,
          floor: createRoomDto.floor,
          roomType: createRoomDto.room_type,
          description: createRoomDto.description,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should throw ConflictException if room with same name already exists', async () => {
      jest.spyOn(service['roomModelAction'], 'get').mockResolvedValue(newRoom);

      await expect(service.create(createRoomDto)).rejects.toThrow(
        sysMsg.ROOM_ALREADY_EXISTS,
      );

      expect(service['roomModelAction'].create).not.toHaveBeenCalled();
    });
  });
});
