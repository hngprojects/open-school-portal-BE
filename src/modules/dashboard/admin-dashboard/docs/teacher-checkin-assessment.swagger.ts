import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import {
  TeacherCheckinAssessmentResponseDto,
  ReviewCheckinResponseDto,
} from '../dto/teacher-checkin-assessment.dto';

export const ApiGetTeacherCheckinRecords = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Retrieve teacher manual check-in records for assessment',
      description:
        'Fetches all teacher manual check-in records with filtering options. ' +
        'Returns check-in details including teacher information, timestamps, reasons, and approval status. ' +
        'Includes summary statistics for pending, approved, and rejected records. ' +
        'Supports filtering by status, date range, and specific teacher. ' +
        'Requires ADMIN role authentication.',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      description: 'Filter by check-in status',
    }),
    ApiQuery({
      name: 'teacher_id',
      required: false,
      type: String,
      description: 'Filter by specific teacher ID',
    }),
    ApiQuery({
      name: 'start_date',
      required: false,
      type: String,
      description: 'Filter from date (YYYY-MM-DD)',
      example: '2025-12-01',
    }),
    ApiQuery({
      name: 'end_date',
      required: false,
      type: String,
      description: 'Filter to date (YYYY-MM-DD)',
      example: '2025-12-31',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number for pagination',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of records per page',
      example: 20,
    }),
    ApiResponse({
      status: 200,
      description: 'Teacher check-in records retrieved successfully',
      type: TeacherCheckinAssessmentResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Invalid role or permissions',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );

export const ApiReviewTeacherCheckin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Review and approve/reject teacher manual check-in',
      description:
        'Allows admin to approve or reject a teacher manual check-in record. ' +
        'Updates the status and records reviewer information with timestamp. ' +
        'Optional review notes can be added to explain the decision. ' +
        'Requires ADMIN role authentication.',
    }),
    ApiResponse({
      status: 200,
      description: 'Check-in record reviewed successfully',
      type: ReviewCheckinResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Check-in record not found',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Check-in record not found' },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Record already reviewed',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'string',
            example: 'Check-in record has already been reviewed',
          },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Invalid role or permissions',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden' },
          error: { type: 'string', example: 'Forbidden' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
