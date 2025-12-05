import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TeacherManualCheckinResponseDto } from '../dto';

export const ApiCreateTeacherManualCheckinDocs = () =>
  applyDecorators(
    ApiTags('Attendance'),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new teacher manual checkin (Teacher only)',
      description: 'Create a new teacher manual checkin (Teacher only)',
    }),

    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Teacher manual checkin created successfully',
      type: TeacherManualCheckinResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Validation error',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
    ApiConflictResponse({
      description: 'Already checked in for this date',
    }),
    ApiNotFoundResponse({
      description: 'Teacher not found',
    }),
  );
