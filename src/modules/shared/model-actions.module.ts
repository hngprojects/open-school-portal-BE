import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSession } from '../academic-session/entities/academic-session.entity';
import { AcademicSessionModelAction } from '../academic-session/model-actions/academic-session-actions';
import { ClassTeacher } from '../class/entities/class-teacher.entity';
import { Class } from '../class/entities/class.entity';
import { ClassTeacherModelAction } from '../class/model-actions/class-teacher.action';
import { ClassModelAction } from '../class/model-actions/class.actions';

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassTeacher, AcademicSession])],
  providers: [
    ClassModelAction,
    ClassTeacherModelAction,
    AcademicSessionModelAction,
  ],
  exports: [
    ClassModelAction,
    ClassTeacherModelAction,
    AcademicSessionModelAction,
  ],
})
export class ModelActionsModule {}
