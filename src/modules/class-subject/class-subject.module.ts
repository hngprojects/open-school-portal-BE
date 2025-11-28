import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassModule } from '../class/class.module';
import { SubjectModule } from '../subject/subject.module';

import { ClassSubjectController } from './controllers/class-subject.controller';
import { ClassSubject } from './entities/class-subject.entity';
import { ClassSubjectModelAction } from './model-actions/class-subject.actions';
import { ClassSubjectService } from './services/class-subject.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSubject]),
    ClassModule,
    SubjectModule,
  ],
  controllers: [ClassSubjectController],
  providers: [ClassSubjectService, ClassSubjectModelAction],
})
export class ClassSubjectModule {}
