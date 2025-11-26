import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { DepartmentResponseDto } from '../dto/department-response.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

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

/** * Swagger decorators for Find All Departments endpoint
 */
export const ApiFindAllDepartments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get All Departments',
      description: 'Retrieves a list of all departments.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Departments retrieved successfully.',
      type: [DepartmentResponseDto],
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid query parameters.',
    }),
  );
/**
 * Swagger decorators for Update Department endpoint
 */
export const ApiUpdateDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update Department',
      description:
        'Updates an existing department. Department name must be unique.',
    }),
    ApiParam({
      name: 'id',
      description: 'Department ID',
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({
      type: UpdateDepartmentDto,
      description: 'Update department payload',
      examples: {
        example1: {
          summary: 'Update Department Name',
          value: {
            name: 'Science & Technology',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Department updated successfully.',
      type: DepartmentResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Department not found.',
    }),
    ApiResponse({
      status: 409,
      description: 'Department with this name already exists.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data or operation failed.',
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
