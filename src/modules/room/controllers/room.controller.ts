import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import * as sysMsg from '../../../constants/system.messages';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import {
  ApiCreateRoom,
  ApiFindAllRooms,
  ApiFindOneRoom,
  ApiUpdateRoom,
} from '../docs/room-swagger';
import { CreateRoomDTO } from '../dto/create-room-dto';
import { UpdateRoomDTO } from '../dto/update-room-dto';
import { RoomService } from '../services/room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateRoom()
  async create(@Body() createRoomDto: CreateRoomDTO) {
    const data = await this.roomService.create(createRoomDto);

    return {
      message: sysMsg.ROOM_CREATED_SUCCESSFULLY,
      data,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiFindAllRooms()
  async findAll() {
    const data = await this.roomService.findAll();

    return {
      message: sysMsg.ROOM_LIST_RETRIEVED_SUCCESSFULLY,
      data,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiFindOneRoom()
  async findOne(@Param('id') id: string) {
    const data = await this.roomService.findOne(id);

    return {
      message: sysMsg.ROOM_RETRIEVED_SUCCESSFULLY,
      data,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiUpdateRoom()
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDTO) {
    const data = await this.roomService.update(id, updateRoomDto);

    return {
      message: sysMsg.ROOM_UPDATED_SUCCESSFULLY,
      data,
    };
  }
}
