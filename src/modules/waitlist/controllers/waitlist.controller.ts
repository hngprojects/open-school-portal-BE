import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';
import {
  DocsCreateWaitlistEntry,
  DocsGetAllEntries,
  DocsDeleteWaitlistEntry,
  DocsGetWaitlistEntryById,
} from '../docs/waitlist.decorator';
import { CreateWaitlistDto } from '../dto/create-waitlist.dto';
import { WaitlistService } from '../services/waitlist.service';

@ApiTags('Waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Post()
  @DocsCreateWaitlistEntry()
  async create(@Body() createWaitlistDto: CreateWaitlistDto) {
    const waitlistEntry = await this.waitlistService.create(createWaitlistDto);

    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.WAITLIST_ADDED_SUCCESSFULLY,
      data: {
        id: waitlistEntry.id,
        first_name: waitlistEntry.first_name,
        last_name: waitlistEntry.last_name,
        email: waitlistEntry.email,
        created_at: waitlistEntry.createdAt,
      },
    };
  }

  @Get()
  @DocsGetAllEntries()
  async findAll() {
    const entries = await this.waitlistService.findAll();

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.WAITLIST_RETRIEVED_SUCCESSFULLY,
      data: entries.map((entry) => ({
        id: entry.id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        email: entry.email,
        created_at: entry.createdAt,
      })),
    };
  }

  @Get(':id')
  @DocsGetWaitlistEntryById()
  async findOne(@Param('id') id: string) {
    const entry = await this.waitlistService.findOne(id);

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.OPERATION_SUCCESSFUL,
      data: {
        id: entry.id,
        first_name: entry.first_name,
        last_name: entry.last_name,
        email: entry.email,
        created_at: entry.createdAt,
      },
    };
  }

  @Delete(':id')
  @DocsDeleteWaitlistEntry()
  async remove(@Param('id') id: string) {
    await this.waitlistService.remove(id);

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.OPERATION_SUCCESSFUL,
      data: null,
    };
  }
}
