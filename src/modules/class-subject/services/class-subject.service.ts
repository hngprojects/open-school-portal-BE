import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClassModelAction } from '../../class/model-actions/class.actions';
import { SubjectModelAction } from '../../subject/model-actions/subject.actions';
import { CreateClassSubjectDto } from '../dto/create-class-subject.dto';
import { ClassSubject } from '../entities/class-subject.entity';

@Injectable()
export class ClassSubjectService {
  constructor(
    @InjectRepository(ClassSubject)
    private readonly classSubjectRepository: Repository<ClassSubject>,
    private readonly classModelAction: ClassModelAction,
    private readonly subjectModelAction: SubjectModelAction,
  ) {}

  async assignSubjectToClass(
    createClassSubjectDto: CreateClassSubjectDto,
  ): Promise<ClassSubject> {
    const { className, subjectName, arm } = createClassSubjectDto;

    const classEntity = await this.classModelAction.get({
      identifierOptions: { name: className, arm: arm },
    });
    if (!classEntity) {
      throw new NotFoundException(
        `Class with name ${className} and arm ${arm} not found.`,
      );
    }

    const subjectEntity = await this.subjectModelAction.get({
      identifierOptions: { name: subjectName },
    });
    if (!subjectEntity) {
      throw new NotFoundException(
        `Subject with name ${subjectName} not found.`,
      );
    }

    const existingAssignment = await this.classSubjectRepository.findOne({
      where: {
        class: { id: classEntity.id },
        subject: { id: subjectEntity.id },
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        'Subject is already assigned to this class.',
      );
    }

    const classSubject = this.classSubjectRepository.create({
      class: classEntity,
      subject: subjectEntity,
    });

    return this.classSubjectRepository.save(classSubject);
  }

  async removeSubjectFromClass(assignmentId: string): Promise<void> {
    const assignment = await this.classSubjectRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Subject assignment to class not found.');
    }

    await this.classSubjectRepository.remove(assignment);
  }

  async findSubjectsForClass(
    className: string,
    arm: string,
  ): Promise<ClassSubject[]> {
    const classEntity = await this.classModelAction.get({
      identifierOptions: { name: className, arm: arm },
    });
    if (!classEntity) {
      throw new NotFoundException(
        `Class with name ${className} and arm ${arm} not found.`,
      );
    }
    return this.classSubjectRepository.find({
      where: { class: { id: classEntity.id } },
      relations: ['subject'],
    });
  }

  async findClassesForSubject(subjectName: string): Promise<ClassSubject[]> {
    const subjectEntity = await this.subjectModelAction.get({
      identifierOptions: { name: subjectName },
    });
    if (!subjectEntity) {
      throw new NotFoundException(
        `Subject with name ${subjectName} not found.`,
      );
    }
    return this.classSubjectRepository.find({
      where: { subject: { id: subjectEntity.id } },
      relations: ['class'],
    });
  }
}
