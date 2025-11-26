import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { CreateSubjectDto } from '../dto/create-subject.dto';
import { SubjectResponseDto } from '../dto/subject-response.dto';

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
        'Creates a new subject. Subject name must be unique. Subject must belong to at least one department.',
    }),
    ApiBody({
      type: CreateSubjectDto,
      description: 'Create subject payload',
      examples: {
        example1: {
          summary: 'Biology Subject',
          value: {
            name: 'Biology',
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
      description: 'Subject with this name already exists.',
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
