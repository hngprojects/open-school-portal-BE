import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SYS_MSG } from '../../constants/system-messages';

import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistService } from './waitlist.service';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add user to waitlist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully added to waitlist',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async create(@Body() createWaitlistDto: CreateWaitlistDto) {
    const waitlistEntry = await this.waitlistService.create(createWaitlistDto);

    return {
      status_code: HttpStatus.CREATED,
      message: SYS_MSG.waitlistAddedSuccessfully,
      data: {
        id: waitlistEntry.id,
        first_name: waitlistEntry.first_name,
        last_name: waitlistEntry.last_name,
        email: waitlistEntry.email,
        created_at: waitlistEntry.created_at,
      },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all waitlist entries' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Waitlist entries retrieved successfully',
  })
  async findAll() {
    const entries = await this.waitlistService.findAll();

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.waitlistRetrievedSuccessfully,
      data: entries.map((entry) => ({
        id: entry.id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        email: entry.email,
        created_at: entry.created_at,
      })),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific waitlist entry' })
  async findOne(@Param('id') id: string) {
    const entry = await this.waitlistService.findOne(id);

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.operationSuccessful,
      data: {
        id: entry.id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        email: entry.email,
        created_at: entry.created_at,
      },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove entry from waitlist' })
  async remove(@Param('id') id: string) {
    await this.waitlistService.remove(id);

    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.waitlistRemovedSuccessfully,
      data: null,
    };
  }
}
