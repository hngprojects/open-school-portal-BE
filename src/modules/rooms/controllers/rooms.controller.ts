import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { DocsCreateRoom } from '../docs/room.decorator';
import { CreateRoomDto } from '../dto/create-room.dto';
import { RoomsService } from '../services/rooms.service';

@ApiTags('Rooms')
@Controller('rooms')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  // --- POST: CREATE ROOM (ADMIN ONLY) ---
  @Post('')
  @DocsCreateRoom()
  async create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }
}
