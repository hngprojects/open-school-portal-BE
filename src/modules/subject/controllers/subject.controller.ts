import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { SubjectSwagger } from '../docs/subject.swagger';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { SubjectService } from '../services/subject.service';

@ApiTags('Subject')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(SubjectSwagger.decorators.create.operation)
  @ApiBody(SubjectSwagger.decorators.create.body)
  @ApiResponse(SubjectSwagger.decorators.create.response)
  @ApiResponse(SubjectSwagger.decorators.create.errorResponses[0])
  @ApiResponse(SubjectSwagger.decorators.create.errorResponses[1])
  @ApiResponse(SubjectSwagger.decorators.create.errorResponses[2])
  //CREATE SUBJECT
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(SubjectSwagger.decorators.findAll.operation)
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
  @ApiResponse(SubjectSwagger.decorators.findAll.response)
  //LIST SUBJECTS
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return this.subjectService.findAll({
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(SubjectSwagger.decorators.findOne.operation)
  @ApiParam(SubjectSwagger.decorators.findOne.parameters.id)
  @ApiResponse(SubjectSwagger.decorators.findOne.response)
  @ApiResponse(SubjectSwagger.decorators.findOne.errorResponses[0])
  //GET SUBJECT BY ID
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(SubjectSwagger.decorators.update.operation)
  @ApiParam(SubjectSwagger.decorators.update.parameters.id)
  @ApiBody(SubjectSwagger.decorators.update.body)
  @ApiResponse(SubjectSwagger.decorators.update.response)
  @ApiResponse(SubjectSwagger.decorators.update.errorResponses[0])
  @ApiResponse(SubjectSwagger.decorators.update.errorResponses[1])
  @ApiResponse(SubjectSwagger.decorators.update.errorResponses[2])
  //UPDATE SUBJECT
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(SubjectSwagger.decorators.remove.operation)
  @ApiParam(SubjectSwagger.decorators.remove.parameters.id)
  @ApiResponse(SubjectSwagger.decorators.remove.response)
  @ApiResponse(SubjectSwagger.decorators.remove.errorResponses[0])
  //DELETE SUBJECT
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subjectService.remove(id);
  }
}
