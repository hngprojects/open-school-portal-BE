import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource, In } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { SubjectModelAction } from '../../subject/model-actions/subject.actions';
import { CreateClassSubjectsResponseDto } from '../dto';
import { ClassModelAction, ClassSubjectModelAction } from '../model-actions';

@Injectable()
export class ClassSubjectService {
  private readonly logger: Logger;
  constructor(
    private readonly classSubjectAction: ClassSubjectModelAction,
    private readonly classModelAction: ClassModelAction,
    private readonly subjectModelAction: SubjectModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: ClassSubjectService.name });
  }

  async list(classId: string) {
    const eClass = await this.classModelAction.get({
      identifierOptions: { id: classId },
    });
    if (!eClass) throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    return this.classSubjectAction.list({
      filterRecordOptions: {
        class: { id: classId },
      },
    });
  }

  async create(classId: string, subjectIds: string[]) {
    const {
      class: eClass,
      validSubjects,
      invalidSubjects,
      existingSubjects,
      newSubjects,
    } = await this.validateInputAndReturnData(classId, subjectIds);

    console.log(newSubjects);

    if (newSubjects.length === 0)
      return new CreateClassSubjectsResponseDto(
        sysMsg.CLASS_SUBJECTS_CREATED(0),
        validSubjects,
        existingSubjects,
        invalidSubjects,
      );

    await this.dataSource.transaction(async (manager) => {
      await this.classSubjectAction.createMany({
        createPayloads: newSubjects.map((subjectId) => ({
          class: eClass,
          subject: { id: subjectId },
        })),
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });
    });

    return new CreateClassSubjectsResponseDto(
      sysMsg.CLASS_SUBJECTS_CREATED(newSubjects.length),
      newSubjects,
      existingSubjects,
      invalidSubjects,
    );
  }

  private async validateInputAndReturnData(
    classId: string,
    subjectIds: string[],
  ) {
    const eClass = await this.classModelAction.get({
      identifierOptions: { id: classId },
    });
    if (!eClass) throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);

    const subjects = await this.subjectModelAction.find({
      findOptions: {
        id: In(subjectIds),
      },
      transactionOptions: { useTransaction: false },
    });

    const foundSet = new Set(subjects.payload.map((s) => s.id));

    const validSubjects = subjectIds.filter((id) => foundSet.has(id));
    const invalidSubjects = subjectIds.filter((id) => !foundSet.has(id));

    const subjectsInClass = await this.classSubjectAction.list({
      filterRecordOptions: {
        class: { id: classId },
        subject: { id: In(subjectIds) },
      },
      relations: {
        subject: true,
      },
    });

    const classSubjectsSet = new Set(
      subjectsInClass.payload.map((s) => s.subject.id),
    );
    const existingSubjects = subjectIds.filter((id) =>
      classSubjectsSet.has(id),
    );

    const newSubjects = validSubjects.filter((id) => !classSubjectsSet.has(id));

    return {
      class: eClass,
      validSubjects,
      invalidSubjects,
      existingSubjects,
      newSubjects,
    };
  }
}
