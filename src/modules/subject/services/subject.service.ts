import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectResponseDto } from '../dto/subject-response.dto';
import { Subject } from '../entities/subject.entity';
import { IBaseResponse } from '../interface/types';
import { SubjectModelAction } from '../model-actions/subject.actions';

@Injectable()
export class SubjectService {
  private readonly logger: Logger;

  constructor(
    private readonly subjectModelAction: SubjectModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: SubjectService.name });
  }

  //CREATE SUBJECT
  async create(
    createSubjectDto: CreateSubjectDto,
  ): Promise<IBaseResponse<SubjectResponseDto>> {
    return this.dataSource.transaction(async (manager) => {
      // Check if subject with same name exists
      const existingSubject = await this.subjectModelAction.get({
        identifierOptions: { name: createSubjectDto.name },
      });

      if (existingSubject) {
        throw new ConflictException(sysMsg.SUBJECT_ALREADY_EXISTS);
      }

      // Create subject
      const newSubject = await this.subjectModelAction.create({
        createPayload: {
          name: createSubjectDto.name,
        },
        transactionOptions: {
          useTransaction: true,
          transaction: manager,
        },
      });

      return {
        message: sysMsg.SUBJECT_CREATED,
        data: this.mapToResponseDto(newSubject),
      };
    });
  }

  private mapToResponseDto(subject: Subject): SubjectResponseDto {
    return {
      id: subject.id,
      name: subject.name,
      created_at: subject.createdAt,
      updated_at: subject.updatedAt,
    };
  }
}
