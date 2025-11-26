import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateAcademicSessionDto {
  @IsNotEmpty({ message: 'Session name is required.' })
  @IsString({ message: 'Session name must be a string.' })
  @MaxLength(100, { message: 'Session name cannot exceed 100 characters.' })
  name: string;

  @IsNotEmpty({ message: 'Start date is required.' })
  @IsDateString(
    { strict: true },
    { message: 'Start date must be a valid ISO date string (YYYY-MM-DD).' },
  )
  start_date: string;

  @IsNotEmpty({ message: 'End date is required.' })
  @IsDateString(
    { strict: true },
    { message: 'End date must be a valid ISO date string (YYYY-MM-DD).' },
  )
  end_date: string;
}

export class UpdateAcademicSessionResponseDto {
  @ApiProperty({
    example: 'Academic session updated successfully',
    nullable: false,
  })
  message: string;

  @ApiProperty({
    example: '2024/2025',
    nullable: false,
  })
  name: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    nullable: false,
  })
  start_ate: Date;

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
    nullable: false,
  })
  end_date: Date;
}
