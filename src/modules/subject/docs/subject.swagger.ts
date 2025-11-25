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

import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectResponseDto } from '../dto/subject-response.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

/**
 * Swagger documentation for Subject endpoints.
 *
 * @module Subject
 */

/**
 * Swagger decorators for Subject endpoints
 */
export const ApiSubjectTags = () => applyDecorators(ApiTags('Subject'));

export const ApiSubjectBearerAuth = () => applyDecorators(ApiBearerAuth());

/**
 * Swagger decorators for Create Subject endpoint
 */
export const ApiCreateSubject = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create Subject',
      description:
        'Creates a new subject. Subject name and code combination must be unique. Subject must belong to at least one department.',
    }),
    ApiBody({
      type: CreateSubjectDto,
      description: 'Create subject payload',
      examples: {
        example1: {
          summary: 'Biology 101',
          value: {
            name: 'Biology',
            code: '101',
            departmentIds: ['550e8400-e29b-41d4-a716-446655440000'],
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Subject created successfully.',
      type: SubjectResponseDto,
    }),
    ApiResponse({
      status: 409,
      description:
        'Subject with this name and code combination already exists.',
    }),
    ApiResponse({
      status: 404,
      description: 'One or more departments not found.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data.',
    }),
  );

/**
 * Swagger decorators for Find All Subjects endpoint
 */
export const ApiFindAllSubjects = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get All Subjects',
      description:
        'Retrieves all subjects with pagination support. Defaults to page 1 and limit 20 if not provided.',
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
      description: 'Paginated list of subjects.',
      type: SubjectResponseDto,
      isArray: true,
    }),
  );

/**
 * Swagger decorators for Find One Subject endpoint
 */
export const ApiFindOneSubject = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get Subject by ID',
      description: 'Retrieves a single subject by its ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Subject ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Subject details.',
      type: SubjectResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Subject not found.',
    }),
  );

/**
 * Swagger decorators for Update Subject endpoint
 */
export const ApiUpdateSubject = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update Subject',
      description:
        'Updates an existing subject. Only name and code can be updated. Departments cannot be changed.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Subject ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiBody({
      type: UpdateSubjectDto,
      description: 'Update subject payload',
      examples: {
        example1: {
          summary: 'Update Subject Name and Code',
          value: {
            name: 'Advanced Biology',
            code: '201',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Subject updated successfully.',
      type: SubjectResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Subject not found.',
    }),
    ApiResponse({
      status: 409,
      description:
        'Subject with this name and code combination already exists.',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input data.',
    }),
  );

/**
 * Swagger decorators for Delete Subject endpoint
 */
export const ApiRemoveSubject = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete Subject',
      description: 'Deletes a subject by its ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'The Subject ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Subject deleted successfully.',
    }),
    ApiResponse({
      status: 404,
      description: 'Subject not found.',
    }),
  );

export const SubjectSwagger = {
  tags: ['Subject'],
  summary: 'Subject Management',
  description:
    'Endpoints for creating, retrieving, updating, and deleting subjects.',
  endpoints: {
    create: {
      summary: 'Create Subject',
      description:
        'Creates a new subject. Subject code must be unique. Subject must belong to at least one department.',
    },
    findAll: {
      summary: 'Get All Subjects',
      description:
        'Retrieves all subjects with pagination support. Defaults to page 1 and limit 20 if not provided.',
    },
    findOne: {
      summary: 'Get Subject by ID',
      description: 'Retrieves a single subject by its ID.',
    },
    update: {
      summary: 'Update Subject',
      description: 'Updates an existing subject.',
    },
    remove: {
      summary: 'Delete Subject',
      description: 'Deletes a subject by its ID.',
    },
  },
  decorators: {
    create: {
      operation: {
        summary: 'Create Subject',
        description:
          'Creates a new subject. Subject code must be unique. Subject must belong to at least one department.',
      },
      body: {
        type: CreateSubjectDto,
        description: 'Create subject payload',
        examples: {
          example1: {
            summary: 'Biology 101',
            value: {
              name: 'Biology',
              code: '101',
              departmentIds: ['550e8400-e29b-41d4-a716-446655440000'],
            },
          },
        },
      },
      response: {
        status: 201,
        description: 'Subject created successfully.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 409,
          description: 'Subject with this code already exists.',
        },
        {
          status: 404,
          description: 'One or more departments not found.',
        },
        {
          status: 400,
          description: 'Invalid input data.',
        },
      ],
    },
    findAll: {
      operation: {
        summary: 'Get All Subjects',
        description:
          'Retrieves all subjects with pagination support. Defaults to page 1 and limit 20 if not provided.',
      },
      response: {
        status: 200,
        description: 'Paginated list of subjects.',
        type: SubjectResponseDto,
        isArray: true,
      },
    },
    findOne: {
      operation: {
        summary: 'Get Subject by ID',
        description: 'Retrieves a single subject by its ID.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Subject details.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject not found.',
        },
      ],
    },
    update: {
      operation: {
        summary: 'Update Subject',
        description: 'Updates an existing subject.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      body: {
        type: UpdateSubjectDto,
        description: 'Update subject payload',
        examples: {
          example1: {
            summary: 'Update Subject Name and Departments',
            value: {
              name: 'Advanced Biology',
              departmentIds: [
                '550e8400-e29b-41d4-a716-446655440000',
                '660e8400-e29b-41d4-a716-446655440001',
              ],
            },
          },
        },
      },
      response: {
        status: 200,
        description: 'Subject updated successfully.',
        type: SubjectResponseDto,
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject or one or more departments not found.',
        },
        {
          status: 409,
          description: 'Subject with this code already exists.',
        },
        {
          status: 400,
          description: 'Invalid input data.',
        },
      ],
    },
    remove: {
      operation: {
        summary: 'Delete Subject',
        description: 'Deletes a subject by its ID.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'The Subject ID (UUID)',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
      response: {
        status: 200,
        description: 'Subject deleted successfully.',
      },
      errorResponses: [
        {
          status: 404,
          description: 'Subject not found.',
        },
      ],
    },
  },
};
