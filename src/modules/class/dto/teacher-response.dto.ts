import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TeacherAssignmentResponseDto {
  @ApiProperty({
    example: 101,
    description: 'Unique identifier of the teacher',
  })
  @Expose()
  teacher_id: number;

  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the teacher' })
  @Expose()
  name: string;

  @ApiProperty({
    example: '2023-09-01T08:00:00Z',
    description: 'Date when the teacher was assigned',
  })
  @Expose()
  assignment_date: Date;

  @ApiPropertyOptional({
    example: ['Science', 'Arts'],
    description: 'The academic streams of the class (e.g. Science, Arts)',
    type: [String],
  })
  @Expose()
  streams?: string[];
}
