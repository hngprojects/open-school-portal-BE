import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Class } from '../class/entities/class.entity';
import { StudentModule } from '../student/student.module';
import { TeacherSubject } from '../teacher-subject/entities/teacher-subject.entity';
import { Term } from '../term/entities/term.entity';

import { GradeController } from './controllers/grade.controller';
import { Grade, GradeSubmission } from './entities';
import { GradeModelAction, GradeSubmissionModelAction } from './model-actions';
import { GradeService } from './services/grade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      GradeSubmission,
      TeacherSubject,
      Term,
      Class,
    ]),
    StudentModule,
  ],
  controllers: [GradeController],
  providers: [GradeService, GradeModelAction, GradeSubmissionModelAction],
  exports: [GradeService, GradeModelAction, GradeSubmissionModelAction],
})
export class GradeModule {}
