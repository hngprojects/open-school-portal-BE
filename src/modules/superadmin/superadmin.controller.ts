import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { SuperadminService } from './superadmin.service';

@Controller('superadmin')
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new superadmin' })
  @ApiResponse({
    status: 201,
    description: sysMsg.SUPERADMIN_ACCOUNT_CREATED,
    type: ApiSuccessResponseDto,
  })
  async create(@Body() createSuperadminDto: CreateSuperadminDto) {
    return this.superadminService.createSuperAdmin(createSuperadminDto);
  }
}
