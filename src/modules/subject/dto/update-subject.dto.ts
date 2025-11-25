import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSubjectDto {
  @ApiProperty({
    description: 'Subject name',
    example: 'Biology',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Subject name cannot be empty if provided.' })
  @IsString({ message: 'Subject name must be a string.' })
  @MaxLength(255, { message: 'Subject name cannot exceed 255 characters.' })
  name?: string;

  @ApiProperty({
    description: 'Subject code (e.g., "101" for Biology 101)',
    example: '101',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Subject code cannot be empty if provided.' })
  @IsString({ message: 'Subject code must be a string.' })
  @MaxLength(50, { message: 'Subject code cannot exceed 50 characters.' })
  code?: string;
}
