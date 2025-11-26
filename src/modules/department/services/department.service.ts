import {
  BadRequestException,
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
import { Department } from '../entities/department.entity';
import { IBaseResponse } from '../interface/types';
import { DepartmentModelAction } from '../model-actions/department.actions';

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

  async remove(id: string): Promise<IBaseResponse<void>> {
    const department = await this.departmentModelAction.get({
      identifierOptions: { id },
      relations: { subjects: true },
    });

    if (!department) {
      throw new NotFoundException(sysMsg.DEPARTMENT_NOT_FOUND);
    }

    // Check if department has subjects
    if (department.subjects && department.subjects.length > 0) {
      throw new BadRequestException(sysMsg.DEPARTMENT_HAS_ASSOCIATED_SUBJECTS);
    }

    await this.departmentModelAction.delete({
      identifierOptions: { id },
      transactionOptions: {
        useTransaction: false,
      },
    });

    return {
      message: sysMsg.DEPARTMENT_DELETED,
      data: undefined,
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
