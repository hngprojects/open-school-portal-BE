import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';
import { TeachersModule } from '../teacher/teacher.module';

import { ClassSubjectController } from './controllers/class-subject.controller';
import { ClassController } from './controllers/class.controller';
import { Class, ClassSubject, ClassTeacher } from './entities';
import {
  ClassTeacherModelAction,
  ClassSubjectModelAction,
  ClassModelAction,
} from './model-actions';
import { ClassSubjectService } from './services/class-subject.service';
import { ClassService } from './services/class.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassTeacher, ClassSubject]),
    AcademicSessionModule,
    TeachersModule,
  ],
  controllers: [ClassController, ClassSubjectController],
  providers: [
    ClassService,
    ClassModelAction,
    ClassTeacherModelAction,
    ClassSubjectModelAction,
    ClassSubjectService,
  ],
  exports: [ClassModelAction, ClassTeacherModelAction],
})
export class ClassModule {}
