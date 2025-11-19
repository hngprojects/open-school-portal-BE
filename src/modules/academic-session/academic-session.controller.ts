import {
  Body,
  Controller,
  Delete,
  Get,
  Param,

  
  Patch,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import * as sysMsg from '../../constants/system.messages';

import { AcademicSessionService } from './academic-session.service';
import { AcademicSessionSwagger } from './docs/academic-session.swagger';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';

@ApiTags('Academic Session')
@Controller('academic-session')
export class AcademicSessionController {
  constructor(
    private readonly academicSessionService: AcademicSessionService,
  ) {}

  @Post()
  @ApiOperation(AcademicSessionSwagger.decorators.create.operation)
  @ApiBody(AcademicSessionSwagger.decorators.create.body)
  @ApiResponse(AcademicSessionSwagger.decorators.create.response)
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionService.create(createAcademicSessionDto);
  }

  @Get('active')
  @ApiOperation(AcademicSessionSwagger.decorators.activeSession.operation)
  @ApiResponse(AcademicSessionSwagger.decorators.activeSession.response)
  async activeSession() {
    const session = await this.academicSessionService.activeSessions();

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACTIVE_ACADEMIC_SESSION_SUCCESS,
      data: session,
    };
  }

  /**
   * Returns a paginated set of sessions.
   * Defaults to simple listing when `page`/`limit` are not provided.
   */
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return this.academicSessionService.findAll({
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  /**
   * Placeholder route to retrieve a single session.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicSessionService.findOne(+id);
  }

  /**
   * Placeholder route to update a session.
   */
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.academicSessionService.update(+id);
  }

  /**
   * Placeholder route to remove a session.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicSessionService.remove(+id);
  }
}
