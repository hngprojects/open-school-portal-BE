import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ClassResponseDto } from './create-class.dto';

export class GetTeacherClassResponseDto {
  @ApiProperty({
    example: 'class fetched successfully',
    description: 'Success message',
  })
  @Expose()
  message: string;

  @ApiProperty({
    description:
      'The class assigned to the teacher. Null if no class is assigned.',
    type: ClassResponseDto,
    nullable: true,
  })
  @Expose()
  data: ClassResponseDto | null;
}
