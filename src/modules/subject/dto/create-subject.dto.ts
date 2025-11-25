import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({
    description: 'Subject name',
    example: 'Biology',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Subject name is required.' })
  @IsString({ message: 'Subject name must be a string.' })
  @MaxLength(255, { message: 'Subject name cannot exceed 255 characters.' })
  name: string;

  @ApiProperty({
    description: 'Subject code (e.g., "101" for Biology 101)',
    example: '101',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Subject code is required.' })
  @IsString({ message: 'Subject code must be a string.' })
  @MaxLength(50, { message: 'Subject code cannot exceed 50 characters.' })
  code: string;

  @ApiProperty({
    description: 'Array of department IDs that this subject belongs to',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    isArray: true,
  })
  @IsNotEmpty({ message: 'At least one department is required.' })
  @IsArray({ message: 'Departments must be an array.' })
  @ArrayMinSize(1, { message: 'At least one department is required.' })
  @IsUUID('4', {
    each: true,
    message: 'Each department ID must be a valid UUID.',
  })
  departmentIds: string[];
}
