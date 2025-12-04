import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateTeacherManualCheckinDto {
  @ApiProperty({
    example: '2025-09-20',
    description: 'Checkin date',
    required: true,
    format: 'YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '07:30:00',
    description: 'Checkin time',
    format: 'HH:MM:SS',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_in_time must be in 24-hour format HH:MM:SS',
  })
  check_in_time: string;

  @ApiProperty({
    example: 'Late due to medical appointment',
    description: 'Reason for checkin',
    required: true,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  @MaxLength(255, { message: 'Reason cannot exceed 255 characters' })
  reason: string;
}
export class TeacherManualCheckinResponseDto {
  @ApiProperty({
    example: '2025-09-20',
    description: 'Checkin date',
  })
  @Expose()
  date: string;

  @ApiProperty({
    example: '07:30:00',
    description: 'Checkin time',
  })
  @Expose()
  check_in_time: string;

  @ApiProperty({
    example: 'Late due to medical appointment',
    description: 'Reason for checkin',
  })
  @Expose()
  reason: string;
}
