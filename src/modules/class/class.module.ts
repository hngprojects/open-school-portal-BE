import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';

import { ClassController } from './controllers/class.controller';
import { Class, ClassSubject, ClassTeacher } from './entities';
import { ClassTeacherModelAction } from './model-actions/class-teacher.action';
import { ClassModelAction } from './model-actions/class.actions';
import { ClassService } from './services/class.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassTeacher, ClassSubject]),
    AcademicSessionModule,
  ],
  controllers: [ClassController],
  providers: [ClassService, ClassModelAction, ClassTeacherModelAction],
  exports: [ClassModelAction, ClassTeacherModelAction],
})
export class ClassModule {}
