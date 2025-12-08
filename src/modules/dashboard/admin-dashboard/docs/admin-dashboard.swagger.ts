import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { DailyAttendanceStatus } from '../../../attendance/enums';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard-response.dto';
import { StudentAttendanceListResponseDto } from '../dto/student-attendance-list.dto';

export const ApiAdminDashboardTags = () =>
  applyDecorators(ApiTags('Admin Dashboard'));

export const ApiAdminDashboardBearerAuth = () =>
  applyDecorators(ApiBearerAuth());

export const ApiLoadTodayActivities = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Retrieve all scheduled academic activities for today',
      description:
        'Fetches all academic activities scheduled for the current date across the school. ' +
        'Aggregates timetable records with teacher, subject, class, and venue details. ' +
        'Returns data sorted chronologically by start time with progress status calculated based on current time. ' +
        'Includes summary statistics for monitoring daily operations and identifying unassigned teachers or scheduling conflicts. ' +
        'Requires ADMIN role authentication.',
    }),
    ApiResponse({
      status: 200,
      description: "Today's activities loaded successfully",
      type: AdminDashboardResponseDto,
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

export const ApiGetStudentAttendanceList = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get paginated student attendance list with filters',
      description:
        'Retrieves a paginated list of student daily attendance records with comprehensive filtering and sorting options. ' +
        'Allows admins to filter by student, class, teacher, status, and date. ' +
        'Supports search across student names and registration numbers. ' +
        'Returns detailed attendance information including check-in/check-out times, notes, and who marked the attendance. ' +
        'Requires ADMIN role authentication.',
    }),
    ApiQuery({
      name: 'date',
      required: true,
      description: 'Date for attendance records (YYYY-MM-DD format)',
      example: '2025-12-05',
      type: String,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (must be positive integer)',
      example: 1,
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of records per page (must be positive integer)',
      example: 10,
      type: Number,
    }),
    ApiQuery({
      name: 'student_id',
      required: false,
      description: 'Filter by student ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440000',
      type: String,
    }),
    ApiQuery({
      name: 'class_id',
      required: false,
      description: 'Filter by class ID (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: String,
    }),
    ApiQuery({
      name: 'subject_id',
      required: false,
      description:
        'Filter by subject ID (UUID) - Note: Not applicable for daily attendance',
      example: '550e8400-e29b-41d4-a716-446655440002',
      type: String,
    }),
    ApiQuery({
      name: 'teacher_id',
      required: false,
      description: 'Filter by teacher ID who marked attendance (UUID)',
      example: '550e8400-e29b-41d4-a716-446655440003',
      type: String,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'Filter by attendance status (must be enumerated value)',
      enum: DailyAttendanceStatus,
      example: DailyAttendanceStatus.PRESENT,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description:
        'Search term for student first name, last name, or registration number',
      example: 'John',
      type: String,
    }),
    ApiQuery({
      name: 'sort_by',
      required: false,
      description:
        'Sort field: student_name, class_name, status, check_in_time, date',
      example: 'student_name',
      type: String,
    }),
    ApiQuery({
      name: 'sort_order',
      required: false,
      description: 'Sort order: ASC or DESC',
      example: 'ASC',
      enum: ['ASC', 'DESC'],
    }),
    ApiResponse({
      status: 200,
      description: 'Student attendance records retrieved successfully',
      type: StudentAttendanceListResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid query parameters',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: {
            type: 'array',
            items: { type: 'string' },
            example: ['date must be a valid ISO 8601 date string'],
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
