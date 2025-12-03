import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateClassDto {
  @ApiProperty({
    example: 'JSS1',
    description: 'The new name of the class (optional).',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().replace(/\s+/g, ' ').toUpperCase()
      : value,
  )
  name?: string;

  @ApiProperty({
    example: 'A',
    description: 'The new arm of the class (optional).',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  arm?: string;

  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description:
      'Array of teacher UUIDs. Only the first teacher will be assigned as the form teacher (optional).',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  teacherIds?: string[];
}
