import { ApiProperty } from '@nestjs/swagger';

export class TeacherCheckinRecordDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'uuid-teacher-456' })
  teacher_id: string;

  @ApiProperty({
    example: {
      id: 'uuid-teacher-456',
      title: 'Mr.',
      first_name: 'John',
      last_name: 'Doe',
      full_name: 'Mr. John Doe',
    },
  })
  teacher: {
    id: string;
    title: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };

  @ApiProperty({ example: '2025-12-04' })
  check_in_date: string;

  @ApiProperty({ example: '2025-12-04T07:30:00Z' })
  check_in_time: string;

  @ApiProperty({ example: '2025-12-04T07:25:00Z' })
  submitted_at: string;

  @ApiProperty({ example: 'Late due to medical appointment' })
  reason: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  status: string;

  @ApiProperty({ example: 'uuid-reviewer-789', nullable: true })
  reviewed_by: string | null;

  @ApiProperty({ example: '2025-12-04T08:00:00Z', nullable: true })
  reviewed_at: string | null;

  @ApiProperty({ example: 'Approved - Valid reason provided', nullable: true })
  review_notes: string | null;
}

export class TeacherCheckinAssessmentDataDto {
  @ApiProperty({
    type: [TeacherCheckinRecordDto],
    description: 'List of teacher manual check-in records',
  })
  checkin_records: TeacherCheckinRecordDto[];

  @ApiProperty({
    example: {
      total_records: 45,
      pending_records: 12,
      approved_records: 28,
      rejected_records: 5,
      late_checkins: 18,
      on_time_checkins: 27,
    },
    description: 'Summary statistics for teacher check-ins',
  })
  summary: {
    total_records: number;
    pending_records: number;
    approved_records: number;
    rejected_records: number;
    late_checkins: number;
    on_time_checkins: number;
  };
}

export class TeacherCheckinAssessmentResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Teacher check-in records retrieved successfully' })
  message: string;

  @ApiProperty({ type: TeacherCheckinAssessmentDataDto })
  data: TeacherCheckinAssessmentDataDto;
}

export class ReviewCheckinDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: ['APPROVED', 'REJECTED'],
    description: 'Review decision',
  })
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    example: 'Approved - Valid medical reason provided',
    description: 'Review notes',
    required: false,
  })
  review_notes?: string;
}

export class ReviewCheckinResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Check-in record reviewed successfully' })
  message: string;

  @ApiProperty({ type: TeacherCheckinRecordDto })
  data: TeacherCheckinRecordDto;
}
