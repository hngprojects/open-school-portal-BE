import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  DocsAssignSubjectToClass,
  DocsGetClassSubjects,
  DocsRemoveSubjectFromClass,
  DocsGetSubjectClasses,
} from '../docs/class-subject.decorator';
import { CreateClassSubjectDto } from '../dto/create-class-subject.dto';
import { ClassSubject } from '../entities/class-subject.entity';
import { ClassSubjectService } from '../services/class-subject.service';

@ApiTags('Class Subjects')
@Controller('class-subjects')
export class ClassSubjectController {
  constructor(private readonly classSubjectService: ClassSubjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @DocsAssignSubjectToClass()
  assignSubjectToClass(
    @Body() assignSubjectToClass: CreateClassSubjectDto,
  ): Promise<ClassSubject> {
    return this.classSubjectService.assignSubjectToClass(assignSubjectToClass);
  }

  @Delete(':assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DocsRemoveSubjectFromClass()
  removeSubjectFromClass(
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
  ): Promise<void> {
    return this.classSubjectService.removeSubjectFromClass(assignmentId);
  }

  @Get('class/:className/arm/:arm')
  @HttpCode(HttpStatus.OK)
  @DocsGetClassSubjects()
  getClassSubjects(
    @Param('className') className: string,
    @Param('arm') arm: string,
  ): Promise<ClassSubject[]> {
    return this.classSubjectService.findSubjectsForClass(className, arm);
  }

  @Get('subject/:subjectName')
  @HttpCode(HttpStatus.OK)
  @DocsGetSubjectClasses()
  getSubjectClasses(
    @Param('subjectName') subjectName: string,
  ): Promise<ClassSubject[]> {
    return this.classSubjectService.findClassesForSubject(subjectName);
  }
}
