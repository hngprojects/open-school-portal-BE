import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassTeacher } from '../entities/class-teacher.entity';

@Injectable()
export class ClassTeacherModelAction extends AbstractModelAction<ClassTeacher> {
  constructor(
    @InjectRepository(ClassTeacher)
    classStudentRepository: Repository<ClassTeacher>,
  ) {
    super(classStudentRepository, ClassTeacher);
  }
}
