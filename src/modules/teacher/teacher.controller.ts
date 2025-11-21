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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../../common/decorators/public.decorator';
import { AUTH_LIMIT } from '../../config/throttle.config';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../shared/enums';

import {
  CreateTeacherDto,
  GetTeachersQueryDto,
  TeacherResponseDto,
  UpdateTeacherDto,
} from './dto';
import { GeneratePasswordResponseDto } from './dto/generate-password-response.dto';
import { TeacherService } from './teacher.service';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Teachers')
@ApiBearerAuth()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Throttle({ default: AUTH_LIMIT })
  @Public() // Mark as public endpoint (bypasses JWT auth)
  @Get('generate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Generate a strong password for teacher creation (Public endpoint, rate limited)',
    description:
      'This is a public endpoint that generates secure passwords. Rate limited to 10 requests per minute per IP address.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password generated successfully',
    type: GeneratePasswordResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests. Please try again later.',
  })
  async generatePassword(): Promise<GeneratePasswordResponseDto> {
    return this.teacherService.generatePassword();
  }

  // --- POST: CREATE TEACHER (ADMIN ONLY) ---
  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new teacher (ADMIN only)' })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({
    status: 201,
    description: 'Teacher created successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email or Employment ID already exists',
  })
  async create(
    @Body() createDto: CreateTeacherDto,
  ): Promise<TeacherResponseDto> {
    return this.teacherService.create(createDto);
  }

  // --- GET: LIST ALL TEACHERS (ADMIN/TEACHER READ) ---
  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Get all teachers with pagination, search, and active status filter',
  })
  @ApiResponse({
    status: 200,
    description: 'List of teachers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/TeacherResponseDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        total_pages: { type: 'number', example: 5 },
      },
    },
  })
  async findAll(@Query() query: GetTeachersQueryDto) {
    return this.teacherService.findAll(query);
  }

  // --- GET: GET TEACHER BY ID (ADMIN/TEACHER READ) ---
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get teacher by ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher retrieved successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TeacherResponseDto> {
    return this.teacherService.findOne(id);
  }

  // --- PATCH: UPDATE TEACHER (ADMIN ONLY) ---
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update teacher (partial, ADMIN only)' })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: 'Teacher updated successfully',
    type: TeacherResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 409, description: 'Employment ID cannot be updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTeacherDto,
  ): Promise<TeacherResponseDto> {
    return this.teacherService.update(id, updateDto);
  }

  // --- DELETE: DEACTIVATE TEACHER (ADMIN ONLY) ---
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate teacher (Soft Delete/Set Inactive, ADMIN only)',
  })
  @ApiResponse({
    status: 204,
    description: 'Teacher deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.teacherService.remove(id);
  }
}
