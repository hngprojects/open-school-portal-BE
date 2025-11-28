import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { SubjectModelAction } from '../../subject/model-actions/subject.actions';
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

  async getClassSubjects(classId: string) {
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

  // async assignSubjectsToClass(classId: string, subjectIds: string[]) {
  //   await this.dataSource.transaction(async (manager) => {
  //     for (const subject of foundSubjects.payload) {
  //       await this.classSubjectAction.create({
  //         createPayload: {
  //           class: eClass,
  //           subject,
  //         },
  //         transactionOptions: {
  //           useTransaction: true,
  //           transaction: manager,
  //         },
  //       });
  //     }
  //   });
  // }

  // removeSubjectsFromClass(classId: string, subjectIds: string[]) {
  //   const eClass = await this.classModelAction.get({
  //     identifierOptions: { id: classId },
  //   });
  //   if (!eClass) throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
  //   const foundSubjects = await this.subjectModelAction.find({
  //     findOptions: {},
  //   });
  // }

  // private async validateInputAndReturnData(
  //   classId: string,
  //   subjectIds: string[],
  // ) {
  //   const eClass = await this.classModelAction.get({
  //     identifierOptions: { id: classId },
  //   });
  //   if (!eClass) throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);

  //   const foundSubjects = await this.subjectModelAction.find({
  //     findOptions: {
  //       id: In(subjectIds),
  //     },
  //     transactionOptions: { useTransaction: false },
  //   });

  //   const subjectsAlreadyAddedToClass = await this.classSubjectAction.find({
  //     findOptions: {
  //       class: { id: classId },
  //       subject: { id: In(subjectIds) },
  //     },
  //     transactionOptions: { useTransaction: false },
  //   });

  //   return {
  //     class,
  //     validSubjects,
  //     subjectsAlreadyAddedToClass,
  //   }
  // }
}
