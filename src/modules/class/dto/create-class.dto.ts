import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({
    example: 's1a2b3c4-5678-90ab-cdef-1234567890ab',
    description: 'The ID of the session during which the teacher is assigned',
  })
  @IsNotEmpty({ message: 'session_id is required' })
  session_id: string;

  @ApiProperty({
    example: 'SSS 2',
    description: 'The name of the class. Letters, numbers, and spaces only.',
  })
  @IsNotEmpty({ message: 'Class name cannot be empty' })
  @Matches(/^[a-zA-Z0-9 ]+$/, {
    message: 'Class name can only contain letters, numbers, and spaces',
  })
  name: string;

  @ApiProperty({
    example: 'Science',
    description: 'Optional stream for the class, e.g., Science, Arts, Commerce',
    required: false,
  })
  @IsOptional()
  @IsString()
  stream?: string;
}
