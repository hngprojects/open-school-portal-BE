import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import * as sysMsg from '../../constants/system.messages';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../shared/enums';

import { ClassesService } from './class.service';
import { CreateClassDto, ClassResponseDto } from './dto/create-class.dto';
import { GroupedClassesDto } from './dto/get-class.dto';
import { GetTeachersQueryDto } from './dto/get-teachers-query.dto';
import { TeacherAssignmentResponseDto } from './dto/teacher-response.dto';

@ApiBearerAuth('access-token')
@ApiTags('Classes')
@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new class (ADMIN)',
    description: 'Admin creates a new class with name and level/category.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({
    description: 'Class creation payload',
    type: CreateClassDto,
    examples: {
      valid: {
        summary: 'Valid payload',
        value: {
          class_name: 'JSS2',
          level: 'Junior Secondary',
        },
      },
      invalid: {
        summary: 'Invalid payload (empty name)',
        value: {
          class_name: '',
          level: 'Primary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully.',
    type: ClassResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async createClass(
    @Body() createClassDto: CreateClassDto,
  ): Promise<{ status_code: number; message: string; data: ClassResponseDto }> {
    const created = await this.classesService.createClass(createClassDto);
    // Map entity to response DTO
    const response: ClassResponseDto = {
      id: created.id,
      name: created.name,
      level: created.level,
    };
    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.CLASS_CREATED,
      data: response,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all classes grouped by level',
    description:
      'Returns all classes grouped by their level, with stream count.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({
    status: 200,
    description: 'Grouped classes by level.',
    type: [GroupedClassesDto],
  })
  async getAllClasses(): Promise<{
    status_code: number;
    message: string;
    data: GroupedClassesDto[];
  }> {
    const grouped = await this.classesService.getAllClassesGroupedByLevel();
    return {
      status_code: HttpStatus.OK,
      message: 'Classes fetched successfully',
      data: grouped,
    };
  }

  @Get(':id/teachers')
  @ApiOperation({
    summary: 'Get teachers assigned to a class',
    description:
      'Returns a list of teachers assigned to a specific class ID. Filters by session if provided, otherwise uses current session.',
  })
  @ApiParam({ name: 'id', type: String, description: 'The Class ID' })
  @ApiResponse({
    status: 200,
    description: 'List of assigned teachers.',
    type: [TeacherAssignmentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Class not found.' })
  @ApiResponse({ status: 500, description: 'Database connection failure.' })
  async getTeachers(
    @Param('id', ParseUUIDPipe) classId: string,
    @Query() query: GetTeachersQueryDto,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.classesService.getTeachersByClass(classId, query.session_id);
  }
}
