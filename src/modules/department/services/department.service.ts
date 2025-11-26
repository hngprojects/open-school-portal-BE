import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentResponseDto } from '../dto/department-response.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { Department } from '../entities/department.entity';
import { IBaseResponse } from '../interface/types';
import { DepartmentModelAction } from '../model-actions/department.actions';

export interface IListDepartmentsOptions {
  page?: number;
  limit?: number;
  order?: { [key: string]: 'ASC' | 'DESC' };
}

@Injectable()
export class DepartmentService {
  private readonly logger: Logger;

  constructor(
    private readonly departmentModelAction: DepartmentModelAction,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: DepartmentService.name });
  }

  //CREATE DEPARTMENT
  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<IBaseResponse<DepartmentResponseDto>> {
    // Check if department with same name exists
    const existingDepartment = await this.departmentModelAction.get({
      identifierOptions: { name: createDepartmentDto.name },
    });

    if (existingDepartment) {
      throw new ConflictException(sysMsg.DEPARTMENT_ALREADY_EXISTS);
    }

    const newDepartment = await this.departmentModelAction.create({
      createPayload: {
        name: createDepartmentDto.name,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return {
      message: sysMsg.DEPARTMENT_CREATED,
      data: this.mapToResponseDto(newDepartment),
    };
  }

  //FIND ONE DEPARTMENT
  //
  async findOne(id: string): Promise<IBaseResponse<DepartmentResponseDto>> {
    const department = await this.departmentModelAction.get({
      identifierOptions: { id },
    });

    if (!department) {
      throw new NotFoundException(sysMsg.DEPARTMENT_NOT_FOUND);
    }

    return {
      message: sysMsg.DEPARTMENT_RETRIEVED_SUCCESS,
      data: this.mapToResponseDto(department),
    };
  }

  //FIND ALL DEPARTMENTS
  async findAll(
    options: IListDepartmentsOptions = {},
  ): Promise<IBaseResponse<DepartmentResponseDto[]> & { meta?: unknown }> {
    const normalizedPage = Math.max(1, Math.floor(options.page ?? 1));
    const normalizedLimit = Math.max(1, Math.floor(options.limit ?? 20));

    const { payload, paginationMeta } = await this.departmentModelAction.list({
      order: options.order ?? { name: 'ASC' },
      paginationPayload: {
        page: normalizedPage,
        limit: normalizedLimit,
      },
    });

    return {
      message: sysMsg.DEPARTMENT_RETRIEVED_SUCCESS,
      data: payload.map((dept) => this.mapToResponseDto(dept)),
      meta: paginationMeta,
    };
  }

  private mapToResponseDto(department: Department): DepartmentResponseDto {
    return {
      id: department.id,
      name: department.name,
      created_at: department.createdAt,
      updated_at: department.updatedAt,
    };
  }
}
