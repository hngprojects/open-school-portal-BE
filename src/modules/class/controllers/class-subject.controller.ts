import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import {
  DocsCreateClassSubjects,
  DocsListClassSubjects,
} from '../docs/class-subject.decorator';
import { CreateClassSubjectRequestDto } from '../dto';
import { ClassSubjectService } from '../services/class-subject.service';

@ApiTags('Classes')
@Controller('classes/:id/subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassSubjectController {
  constructor(private readonly classStudentService: ClassSubjectService) {}

  // --- POST: CREATE CLASS (ADMIN ONLY) ---
  @Post('')
  @DocsCreateClassSubjects()
  @Roles(UserRole.ADMIN)
  async create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { subjectIds }: CreateClassSubjectRequestDto,
  ) {
    return this.classStudentService.create(id, subjectIds);
  }

  // --- GET: GROUPED CLASSES ---
  @Get('')
  @DocsListClassSubjects()
  async list(@Param('id', ParseUUIDPipe) id: string) {
    return this.classStudentService.list(id);
  }
}
