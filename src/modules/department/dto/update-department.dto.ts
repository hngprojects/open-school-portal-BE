import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiProperty({
    description: 'Department name',
    example: 'Science',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Department name cannot be empty if provided.' })
  @IsString({ message: 'Department name must be a string.' })
  @MaxLength(255, { message: 'Department name cannot exceed 255 characters.' })
  name?: string;
}
