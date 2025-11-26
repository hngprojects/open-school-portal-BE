import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

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

/**
 * Swagger decorators for Remove Department endpoint
 */
export const ApiRemoveDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete Department',
      description:
        'Deletes a department by ID. Department must not have associated subjects.',
    }),
    ApiResponse({
      status: 200,
      description: 'Department deleted successfully.',
    }),
    ApiResponse({
      status: 404,
      description: 'Department not found.',
    }),
    ApiResponse({
      status: 400,
      description: 'Department has associated subjects and cannot be deleted.',
    }),
  );
