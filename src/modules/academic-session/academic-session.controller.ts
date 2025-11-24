import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  HttpStatus,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import * as sysMsg from '../../constants/system.messages';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../shared/enums';

import { AcademicSessionService } from './academic-session.service';
import { AcademicSessionSwagger } from './docs/academic-session.swagger';
import { ActivateAcademicSessionDto } from './dto/activate-academic-session.dto';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';

@ApiTags('Academic Session')
@Controller('academic-session')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AcademicSessionController {
  constructor(
    private readonly academicSessionService: AcademicSessionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation(AcademicSessionSwagger.decorators.create.operation)
  @ApiBody(AcademicSessionSwagger.decorators.create.body)
  @ApiResponse(AcademicSessionSwagger.decorators.create.response)
  create(@Body() createAcademicSessionDto: CreateAcademicSessionDto) {
    return this.academicSessionService.create(createAcademicSessionDto);
  }

  @Put('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(AcademicSessionSwagger.decorators.activateSession.operation)
  @ApiBody(AcademicSessionSwagger.decorators.activateSession.body)
  @ApiResponse(AcademicSessionSwagger.decorators.activateSession.response)
  @ApiResponse(
    AcademicSessionSwagger.decorators.activateSession.errorResponses[0],
  )
  @ApiResponse(
    AcademicSessionSwagger.decorators.activateSession.errorResponses[1],
  )
  @ApiResponse(
    AcademicSessionSwagger.decorators.activateSession.errorResponses[2],
  )
  async activateAcademicSession(
    @Body() activateDto: ActivateAcademicSessionDto,
  ) {
    return this.academicSessionService.activateSession(activateDto);
  }

  @Post('link-classes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation(AcademicSessionSwagger.decorators.linkClasses.operation)
  @ApiResponse(AcademicSessionSwagger.decorators.linkClasses.response)
  @ApiResponse(AcademicSessionSwagger.decorators.linkClasses.errorResponses[0])
  @ApiResponse(AcademicSessionSwagger.decorators.linkClasses.errorResponses[1])
  async linkClassesToActiveSession() {
    return this.academicSessionService.linkClassesToActiveSession();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation(AcademicSessionSwagger.decorators.activeSession.operation)
  @ApiResponse(AcademicSessionSwagger.decorators.activeSession.response)
  @ApiResponse(
    AcademicSessionSwagger.decorators.activeSession.errorResponses[0],
  )
  @ApiResponse(
    AcademicSessionSwagger.decorators.activeSession.errorResponses[1],
  )
  @ApiResponse(
    AcademicSessionSwagger.decorators.activeSession.errorResponses[2],
  )
  @ApiResponse(
    AcademicSessionSwagger.decorators.activeSession.errorResponses[3],
  )
  async activeSession() {
    const session = await this.academicSessionService.activeSessions();

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACTIVE_ACADEMIC_SESSION_SUCCESS,
      data: session,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation(AcademicSessionSwagger.decorators.findAll.operation)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (defaults to 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (defaults to 20)',
    example: 20,
  })
  @ApiResponse(AcademicSessionSwagger.decorators.findAll.response)
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return this.academicSessionService.findAll({
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicSessionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.academicSessionService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.academicSessionService.remove(+id);
  }
}
