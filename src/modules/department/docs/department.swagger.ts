import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentResponseDto } from '../dto/department-response.dto';

/**
 * Swagger documentation for Department endpoints.
 *
 * @module Department
 */

/**
 * Swagger decorators for Department endpoints
 */
export const ApiDepartmentTags = () => applyDecorators(ApiTags('Department'));

export const ApiDepartmentBearerAuth = () => applyDecorators(ApiBearerAuth());

/**
 * Swagger decorators for Create Department endpoint
 */
export const ApiCreateDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create Department',
      description: 'Creates a new department. Department name must be unique.',
    }),
    ApiBody({
      type: CreateDepartmentDto,
      description: 'Create department payload',
      examples: {
        example1: {
          summary: 'Science Department',
          value: {
            name: 'Science',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Department created successfully.',
      type: DepartmentResponseDto,
    }),
    ApiResponse({
      status: 409,
      description: 'Department with this name already exists.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data.',
    }),
  );

/** * Swagger decorators for Find One Department endpoint
 */
export const ApiFindOneDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get Department by ID',
      description: 'Retrieves a department by its unique ID.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: sysMsg.DEPARTMENT_RETRIEVED_SUCCESS,
      type: DepartmentResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: sysMsg.DEPARTMENT_NOT_FOUND,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: sysMsg.INVALID_DEPARTMENT_ID,
    }),
  );
