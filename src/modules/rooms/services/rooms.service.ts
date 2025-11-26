import {
  ConflictException,
  Inject,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource, ILike } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { CreateRoomDto } from '../dto/create-room.dto';
import { RoomResponseDto } from '../dto/room-response.dto';
import { RoomModelAction } from '../model-actions/room.actions';

export interface ICreateRoomResponse {
  status_code: number;
  message: string;
  data: RoomResponseDto;
}

@Injectable()
export class RoomsService {
  private readonly logger: Logger;
  constructor(
    private readonly roomModelAction: RoomModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: RoomsService.name });
  }

  /**
   * Creates a new room after checking for duplicates.
   */
  async create(createRoomDto: CreateRoomDto): Promise<ICreateRoomResponse> {
    const { name, capacity, location, floor, room_type } = createRoomDto;

    // 1. Check for existing room with the same name
    const existingRoom = await this.roomModelAction.get({
      identifierOptions: { name: ILike(name) },
    });

    if (existingRoom) {
      throw new ConflictException(sysMsg.ROOM_ALREADY_EXISTS);
    }

    // 2. Create and save the new room
    const createRoom = await this.dataSource.transaction(async (manager) => {
      const newRoom = await this.roomModelAction.create({
        createPayload: {
          name,
          capacity,
          location,
          floor,
          room_type,
        },
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });

      this.logger.info(sysMsg.ROOM_CREATED, newRoom);
      return newRoom;
    });
    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.ROOM_CREATED,
      data: plainToInstance(RoomResponseDto, createRoom, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
