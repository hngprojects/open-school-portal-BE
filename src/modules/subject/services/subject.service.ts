import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { FindOptionsOrder, In } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { DepartmentModelAction } from '../../department/model-actions/department.actions';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectResponseDto } from '../dto/subject-response.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { Subject } from '../entities/subject.entity';
import { SubjectModelAction } from '../model-actions/subject.actions';

export interface IListSubjectsOptions {
  page?: number;
  limit?: number;
  order?: FindOptionsOrder<Subject>;
}

export interface IBaseResponse<T> {
  message: string;
  data: T;
}

@Injectable()
export class SubjectService {
  private readonly logger: Logger;

  constructor(
    private readonly subjectModelAction: SubjectModelAction,
    private readonly departmentModelAction: DepartmentModelAction,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: SubjectService.name });
  }

  //CREATE SUBJECT
  async create(
    createSubjectDto: CreateSubjectDto,
  ): Promise<IBaseResponse<SubjectResponseDto>> {
    // Check if subject with same name and code combination exists
    const existingSubjects = await this.subjectModelAction.list({
      filterRecordOptions: {
        name: createSubjectDto.name,
        code: createSubjectDto.code,
      },
    });

    if (existingSubjects.payload.length > 0) {
      throw new ConflictException(sysMsg.SUBJECT_ALREADY_EXISTS);
    }

    // Validate that all departments exist
    const departments = await this.departmentModelAction.list({
      filterRecordOptions: {
        id: In(createSubjectDto.departmentIds),
      },
    });

    if (departments.payload.length !== createSubjectDto.departmentIds.length) {
      throw new NotFoundException(sysMsg.DEPARTMENTS_NOT_FOUND);
    }

    // Create subject with departments
    const newSubject = await this.subjectModelAction.create({
      createPayload: {
        name: createSubjectDto.name,
        code: createSubjectDto.code,
        departments: departments.payload,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    // Construct response directly from newSubject and departments already in memory
    // This avoids an unnecessary database query
    const subjectWithRelations: Subject = {
      ...newSubject,
      departments: departments.payload,
    };

    return {
      message: sysMsg.SUBJECT_CREATED,
      data: this.mapToResponseDto(subjectWithRelations),
    };
  }

  //LIST SUBJECTS
  async findAll(
    options: IListSubjectsOptions = {},
  ): Promise<IBaseResponse<SubjectResponseDto[]> & { meta?: unknown }> {
    const normalizedPage = Math.max(1, Math.floor(options.page ?? 1));
    const normalizedLimit = Math.max(1, Math.floor(options.limit ?? 20));

    const { payload, paginationMeta } = await this.subjectModelAction.list({
      order: options.order ?? { name: 'ASC' },
      paginationPayload: {
        page: normalizedPage,
        limit: normalizedLimit,
      },
      relations: { departments: true },
    });

    return {
      message: sysMsg.SUBJECT_LIST_SUCCESS,
      data: payload.map((subject) => this.mapToResponseDto(subject)),
      meta: paginationMeta,
    };
  }

  //GET SUBJECT BY ID
  async findOne(id: string): Promise<IBaseResponse<SubjectResponseDto>> {
    const subject = await this.subjectModelAction.get({
      identifierOptions: { id },
      relations: { departments: true },
    });

    if (!subject) {
      throw new NotFoundException(sysMsg.SUBJECT_NOT_FOUND);
    }

    return {
      message: sysMsg.SUBJECT_RETRIEVED_SUCCESS,
      data: this.mapToResponseDto(subject),
    };
  }

  //UPDATE SUBJECT
  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<IBaseResponse<SubjectResponseDto>> {
    const subject = await this.subjectModelAction.get({
      identifierOptions: { id },
      relations: { departments: true },
    });

    if (!subject) {
      throw new NotFoundException(sysMsg.SUBJECT_NOT_FOUND);
    }

    // Check if name or code is being updated and if the combination conflicts
    const nameToCheck = updateSubjectDto.name ?? subject.name;
    const codeToCheck = updateSubjectDto.code ?? subject.code;

    // Only check for conflicts if name or code is being changed
    if (
      (updateSubjectDto.name && updateSubjectDto.name !== subject.name) ||
      (updateSubjectDto.code && updateSubjectDto.code !== subject.code)
    ) {
      const existingSubjects = await this.subjectModelAction.list({
        filterRecordOptions: {
          name: nameToCheck,
          code: codeToCheck,
        },
      });

      // If found and it's a different subject (different ID), then it's a conflict
      const conflictingSubject = existingSubjects.payload.find(
        (s) => s.id !== subject.id,
      );
      if (conflictingSubject) {
        throw new ConflictException(sysMsg.SUBJECT_ALREADY_EXISTS);
      }
    }

    // Prepare update payload - only name and code can be updated
    const updatePayload: {
      name?: string;
      code?: string;
    } = {};
    if (updateSubjectDto.name) updatePayload.name = updateSubjectDto.name;
    if (updateSubjectDto.code) updatePayload.code = updateSubjectDto.code;

    const updatedSubject = await this.subjectModelAction.update({
      identifierOptions: { id },
      updatePayload,
      transactionOptions: {
        useTransaction: false,
      },
    });

    if (!updatedSubject) {
      throw new BadRequestException(sysMsg.OPERATION_FAILED);
    }

    const subjectAfterUpdate = await this.subjectModelAction.get({
      identifierOptions: { id },
      relations: { departments: true },
    });

    return {
      message: sysMsg.SUBJECT_UPDATED,
      data: this.mapToResponseDto(subjectAfterUpdate),
    };
  }

  //DELETE SUBJECT
  async remove(id: string): Promise<IBaseResponse<void>> {
    const subject = await this.subjectModelAction.get({
      identifierOptions: { id },
    });

    if (!subject) {
      throw new NotFoundException(sysMsg.SUBJECT_NOT_FOUND);
    }

    await this.subjectModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return {
      message: sysMsg.SUBJECT_DELETED,
      data: undefined,
    };
  }

  private mapToResponseDto(subject: Subject): SubjectResponseDto {
    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      departments: (subject.departments || []).map((dept) => ({
        id: dept.id,
        name: dept.name,
        created_at: dept.createdAt,
        updated_at: dept.updatedAt,
      })),
      created_at: subject.createdAt,
      updated_at: subject.updatedAt,
    };
  }
}
