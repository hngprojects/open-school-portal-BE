import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { CreateClassDto } from './create-class.dto';

export class CreateClassResponseDto extends CreateClassDto {
  @ApiProperty({
    example: 's1a2b3c4-5678-90ab-cdef-1234567890ab',
    description: 'The ID of the session during which the class is created',
  })
  @IsNotEmpty({ message: 'session_id is required' })
  @IsUUID('4', { message: 'session_id must be a valid UUID' })
  session_id: string;
}
