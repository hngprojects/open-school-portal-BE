import { Test, TestingModule } from '@nestjs/testing';

import { RoomsService } from '../services/rooms.service';

import { RoomsController } from './rooms.controller';

describe('RoomsController', () => {
  let controller: RoomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [
        {
          provide: RoomsService,
          useValue: {
            // mock methods used in controller
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoomsController>(RoomsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room', async () => {
      const createRoomDto = {
        name: 'Test Room',
        capacity: 10,
        location: 'Building A',
        floor: '1st Floor',
        roomType: 'Classroom',
        description: 'A room for testing purposes',
      };
      const expectedResult = {
        status_code: 201,
        message: 'Room created successfully',
        data: {
          id: '1',
          name: createRoomDto.name,
          capacity: createRoomDto.capacity,
          location: createRoomDto.location,
          floor: createRoomDto.floor,
          roomType: createRoomDto.roomType,
          description: createRoomDto.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };
      jest
        .spyOn(controller['roomsService'], 'create')
        .mockResolvedValue(expectedResult);

      expect(await controller.create(createRoomDto)).toEqual(expectedResult);
    });
  });
});
