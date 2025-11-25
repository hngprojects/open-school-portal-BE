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

export const DepartmentSwagger = {
  tags: ['Department'],
  summary: 'Department Management',
  description:
    'Endpoints for creating, retrieving, updating, and deleting departments.',
  endpoints: {
    create: {
      summary: 'Create Department',
      description: 'Creates a new department. Department name must be unique.',
    },
    findAll: {
      summary: 'Get All Departments',
      description:
        'Retrieves all departments with pagination support. Defaults to page 1 and limit 20 if not provided.',
    },
    findOne: {
      summary: 'Get Department by ID',
      description: 'Retrieves a single department by its ID.',
    },
    update: {
      summary: 'Update Department',
      description: 'Updates an existing department.',
    },
    remove: {
      summary: 'Delete Department',
      description: 'Deletes a department by its ID.',
    },
  },
  decorators: {
    create: {
      operation: {
        summary: 'Create Department',
        description:
          'Creates a new department. Department name must be unique.',
      },
      body: {
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
      },
      response: {
        status: 201,
        description: 'Department created successfully.',
        type: DepartmentResponseDto,
      },
      errorResponses: [
        {
          status: 409,
          description: 'Department with this name already exists.',
        },
        {
          status: 400,
          description: 'Invalid input data.',
        },
      ],
    },
    findAll: {
      operation: {
        summary: 'Get All Departments',
        description:
          'Retrieves all departments with pagination support. Defaults to page 1 and limit 20 if not provided.',
      },
      response: {
        status: 200,
        description: 'Paginated list of departments.',
        type: DepartmentResponseDto,
        isArray: true,
      },
    },
    findOne: {
      operation: {
        summary: 'Get Department by ID',
        description: 'Retrieves a single department by its ID.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Department ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Department details.',
        type: DepartmentResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Department not found.',
        },
      ],
    },
    update: {
      operation: {
        summary: 'Update Department',
        description: 'Updates an existing department.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Department ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      body: {
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
      },
      response: {
        status: 200,
        description: 'Department updated successfully.',
        type: DepartmentResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Department not found.',
        },
        {
          status: 409,
          description: 'Department with this name already exists.',
        },
      ],
    },
    remove: {
      operation: {
        summary: 'Delete Department',
        description:
          'Deletes a department by its ID. Cannot delete if department has associated subjects.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Department ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Department deleted successfully.',
      },
      errorResponses: [
        {
          status: 404,
          description: 'Department not found.',
        },
        {
          status: 400,
          description: 'Cannot delete department with associated subjects.',
        },
      ],
    },
  },
};
