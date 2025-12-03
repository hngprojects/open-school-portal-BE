import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';
import { StudentModule } from '../student/student.module';
import { TeachersModule } from '../teacher/teacher.module';

import { ClassSubjectController } from './controllers/class-subject.controller';
import { ClassController } from './controllers/class.controller';
import { Class, ClassStudent, ClassSubject } from './entities';
import {
  ClassModelAction,
  ClassStudentModelAction,
  ClassSubjectModelAction,
} from './model-actions';
import { ClassSubjectService } from './services/class-subject.service';
import { ClassService } from './services/class.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassSubject, ClassStudent]),
    AcademicSessionModule,
    StudentModule,
    TeachersModule,
  ],
  controllers: [ClassController, ClassSubjectController],
  providers: [
    ClassService,
    ClassModelAction,
    ClassStudentModelAction,
    ClassSubjectModelAction,
    ClassSubjectService,
  ],
  exports: [ClassModelAction, ClassStudentModelAction],
})
export class ClassModule {}
