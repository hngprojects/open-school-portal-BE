import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import {
  DocsCreateClass,
  DocsGetClassTeachers,
  DocsUpdateClass,
} from '../docs/class.decorator';
import {
  CreateClassDto,
  GetTeachersQueryDto,
  TeacherAssignmentResponseDto,
  UpdateClassDto,
} from '../dto';
import { ClassService } from '../services/class.service';

@ApiTags('Classes')
@Controller('classes')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // --- POST: CREATE CLASS (ADMIN ONLY) ---
  @Post('')
  @DocsCreateClass()
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  // --- PATCH: UPDATE CLASS (ADMIN ONLY) ---
  @Patch(':id')
  @DocsUpdateClass()
  async updateClass(
    @Param('id', ParseUUIDPipe) classId: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.updateClass(classId, updateClassDto);
  }

  @Get(':id/teachers')
  @DocsGetClassTeachers()
  async getTeachers(
    @Param('id', ParseUUIDPipe) classId: string,
    @Query() query: GetTeachersQueryDto,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.classService.getTeachersByClass(classId, query.session_id);
  }
}
