import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, In } from 'typeorm';

import * as sysMsg from '../../../constants/system.messages';
import { Stream } from '../../stream/entities/stream.entity';
import { CreateRoomDTO } from '../dto/create-room-dto';
import { UpdateRoomDTO } from '../dto/update-room-dto';
import { Room } from '../entities/room.entity';
import { RoomStatus, RoomType } from '../enums/room-enum';
import { RoomModelAction } from '../model-actions/room-model-actions';

import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;

  let modelAction: {
    get: jest.Mock;
    create: jest.Mock;
    list: jest.Mock;
  };

  let streamRepo: {
    findBy: jest.Mock;
  };

  let roomRepo: {
    save: jest.Mock;
  };

  let dataSource: {
    getRepository: jest.Mock;
  };

  beforeEach(async () => {
    modelAction = {
      get: jest.fn(),
      create: jest.fn(),
      list: jest.fn(),
    };

    streamRepo = {
      findBy: jest.fn(),
    };
    roomRepo = {
      save: jest.fn(),
    };

    dataSource = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Stream) return streamRepo;
        if (entity === Room) return roomRepo;
        return null;
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: RoomModelAction, useValue: modelAction },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get<RoomService>(RoomService);
  });

  describe('create', () => {
    const dto: CreateRoomDTO = {
      name: '  Main Hall  ',
      type: RoomType.PHYSICAL,
      capacity: 120,
      location: 'West Block',
      building: 'B',
      floor: '2',
      description: 'Lecture hall',
      streams: [],
    };

    it('creates a room when name is free', async () => {
      modelAction.get.mockResolvedValue(null);

      const createdEntity = { id: 'room-1', name: 'main hall' };
      modelAction.create.mockResolvedValue(createdEntity);

      const result = await service.create(dto);

      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { name: 'main hall' },
      });

      expect(modelAction.create).toHaveBeenCalledWith({
        createPayload: expect.objectContaining({
          name: 'main hall',
          streams: [],
        }),
        transactionOptions: { useTransaction: false },
      });

      expect(result).toEqual(createdEntity);
    });

    it('throws conflict when name already exists', async () => {
      modelAction.get.mockResolvedValue({ id: 'existing' });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException if invalid stream IDs are supplied', async () => {
      const withStreams: CreateRoomDTO = { ...dto, streams: ['s1', 's2'] };

      modelAction.get.mockResolvedValue(null);
      streamRepo.findBy.mockResolvedValue([{ id: 's1' } as Stream]);

      await expect(service.create(withStreams)).rejects.toThrow(
        NotFoundException,
      );

      expect(streamRepo.findBy).toHaveBeenCalledWith({ id: In(['s1', 's2']) });
    });

    it('creates a room with valid Stream relationships', async () => {
      const withStreams: CreateRoomDTO = { ...dto, streams: ['s1'] };
      const mockStream = { id: 's1' } as Stream;

      modelAction.get.mockResolvedValue(null);
      streamRepo.findBy.mockResolvedValue([mockStream]);

      const expectedRoom = {
        id: 'room-10',
        name: 'main hall',
        streams: [mockStream],
      };
      modelAction.create.mockResolvedValue(expectedRoom);

      const result = await service.create(withStreams);

      expect(modelAction.create).toHaveBeenCalledWith({
        createPayload: expect.objectContaining({
          name: 'main hall',
          streams: [mockStream],
        }),
        transactionOptions: { useTransaction: false },
      });

      expect(result).toEqual(expectedRoom);
    });
  });

  describe('findAll', () => {
    it('returns a list of rooms', async () => {
      const rooms: Room[] = [{ id: 'r1', name: 'Room 1' } as Room];
      modelAction.list.mockResolvedValue({ payload: rooms });

      const result = await service.findAll();

      expect(modelAction.list).toHaveBeenCalled();
      expect(result).toEqual(rooms);
    });
  });

  describe('findOne', () => {
    it('returns a room when found', async () => {
      const room: Room = { id: 'r1', name: 'Room 1', streams: [] } as Room;
      modelAction.get.mockResolvedValue(room);

      const result = await service.findOne('r1');

      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { id: 'r1' },
        relations: { streams: true },
      });
      expect(result).toEqual(room);
    });

    it('throws NotFoundException if room does not exist', async () => {
      modelAction.get.mockResolvedValue(null);
      await expect(service.findOne('r1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const existingRoom: Room = {
      id: 'r1',
      name: 'room 1',
      streams: [],

      type: RoomType.PHYSICAL,
      status: RoomStatus.AVAILABLE,
      capacity: 10,
      location: 'loc',
      building: 'b',
      floor: '1',
      description: 'desc',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Room;

    it('updates a room with valid data', async () => {
      const updateDto: UpdateRoomDTO = {
        name: ' Updated Room ',
        streams: ['s1'],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingRoom);

      modelAction.get.mockResolvedValue(null);

      const mockStream = { id: 's1' } as Stream;
      streamRepo.findBy.mockResolvedValue([mockStream]);

      const savedRoom = {
        ...existingRoom,
        name: 'updated room',
        streams: [mockStream],
      };
      roomRepo.save.mockResolvedValue(savedRoom);

      const result = await service.update('r1', updateDto);

      expect(service.findOne).toHaveBeenCalledWith('r1');

      expect(modelAction.get).toHaveBeenCalledWith({
        identifierOptions: { name: 'updated room' },
      });

      expect(streamRepo.findBy).toHaveBeenCalledWith({ id: In(['s1']) });

      expect(roomRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'updated room',
          streams: [mockStream],
        }),
      );

      expect(result).toEqual(savedRoom);
    });

    it('throws NotFoundException if room does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException(sysMsg.ROOM_NOT_FOUND));

      await expect(service.update('r1', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException if updated name already exists on DIFFERENT room', async () => {
      const updateDto: UpdateRoomDTO = { name: 'Duplicate Room' };
      const duplicateRoom = { id: 'r2', name: 'duplicate room' } as Room;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingRoom);

      modelAction.get.mockResolvedValue(duplicateRoom);

      await expect(service.update('r1', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('allows update if name exists but belongs to SAME room', async () => {
      const updateDto: UpdateRoomDTO = { name: 'Same Name' };
      const sameRoom = { id: 'r1', name: 'same name' } as Room;

      jest.spyOn(service, 'findOne').mockResolvedValue(existingRoom);
      modelAction.get.mockResolvedValue(sameRoom);
      roomRepo.save.mockResolvedValue(sameRoom);

      await expect(service.update('r1', updateDto)).resolves.not.toThrow();
    });
  });
});
