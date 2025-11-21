import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleTeacherStatusDto {
  @ApiProperty({
    description: 'Active status of the teacher',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
