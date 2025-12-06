import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { DailyAttendanceStatus } from '../../../attendance/enums';

/**
 * Query parameters for filtering, sorting, and paginating student attendance records
 */
export class GetStudentAttendanceListDto {
  @ApiProperty({
    description: 'Date for attendance records (YYYY-MM-DD format)',
    example: '2025-12-05',
    required: true,
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of records per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  student_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by class ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  class_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by subject ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  subject_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by teacher ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsOptional()
  @IsUUID()
  teacher_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by attendance status',
    enum: DailyAttendanceStatus,
    example: DailyAttendanceStatus.PRESENT,
  })
  @IsOptional()
  @IsEnum(DailyAttendanceStatus)
  status?: DailyAttendanceStatus;

  @ApiPropertyOptional({
    description:
      'Search term (searches in student first name, last name, registration number)',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Sort field (e.g., student_name, class_name, status, check_in_time)',
    example: 'student_name',
    default: 'student_name',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'student_name';

  @ApiPropertyOptional({
    description: 'Sort order (ASC or DESC)',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}

/**
 * Individual student attendance record in the list
 */
export class StudentAttendanceListItemDto {
  @ApiProperty({
    description: 'Attendance record ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  student_id: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
  })
  student_first_name: string;

  @ApiProperty({
    description: 'Student middle name',
    example: 'Michael',
    nullable: true,
  })
  student_middle_name?: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  student_last_name: string;

  @ApiProperty({
    description: 'Student registration number',
    example: 'STU2025001',
  })
  student_registration_number: string;

  @ApiProperty({
    description: 'Class ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  class_id: string;

  @ApiProperty({
    description: 'Class name',
    example: 'JSS 1A',
  })
  class_name: string;

  @ApiProperty({
    description: 'Attendance status',
    enum: DailyAttendanceStatus,
    example: DailyAttendanceStatus.PRESENT,
  })
  status: DailyAttendanceStatus;

  @ApiProperty({
    description: 'Date of attendance record',
    example: '2025-12-05',
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '2025-12-05T08:30:00Z',
    nullable: true,
  })
  check_in_time?: string;

  @ApiPropertyOptional({
    description: 'Check-out time',
    example: '2025-12-05T15:00:00Z',
    nullable: true,
  })
  check_out_time?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student arrived late due to traffic',
    nullable: true,
  })
  notes?: string;

  @ApiProperty({
    description: 'Marked by teacher/admin ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  marked_by_id: string;

  @ApiProperty({
    description: 'Marked by teacher/admin name',
    example: 'Mrs. Sarah Johnson',
  })
  marked_by_name: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-12-05T08:00:00Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-12-05T08:30:00Z',
  })
  updated_at: string;
}

/**
 * Paginated response for student attendance list
 */
export class StudentAttendanceListResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Student attendance records retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status_code: number;

  @ApiProperty({
    type: [StudentAttendanceListItemDto],
    description: 'Array of student attendance records',
  })
  data: StudentAttendanceListItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 150,
      page: 1,
      limit: 10,
      total_pages: 15,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
