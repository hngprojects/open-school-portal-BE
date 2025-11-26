import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

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
 * Swagger decorators for Find All Departments endpoint
 */
export const ApiFindAllDepartments = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get All Departments',
      description:
        'Retrieves all departments with pagination support. Defaults to page 1 and limit 20 if not provided.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (defaults to 1)',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page (defaults to 20)',
      example: 20,
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of departments.',
      type: DepartmentResponseDto,
      isArray: true,
    }),
  );

/**
 * Swagger decorators for Find One Department endpoint
 */
export const ApiFindOneDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get Department by ID',
      description: 'Retrieves a single department by its ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Department ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Department details.',
      type: DepartmentResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Department not found.',
    }),
  );

/**
 * Swagger decorators for Update Department endpoint
 */
export const ApiUpdateDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update Department',
      description: 'Updates an existing department.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Department ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({
      type: UpdateDepartmentDto,
      description: 'Update department payload',
      examples: {
        example1: {
          summary: 'Update Department Name',
          value: {
            name: 'Science and Technology',
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
  );

/**
 * Swagger decorators for Delete Department endpoint
 */
export const ApiRemoveDepartment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete Department',
      description:
        'Deletes a department by its ID. Cannot delete if department has associated subjects.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Department ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
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
      description: 'Cannot delete department with associated subjects.',
    }),
  );
