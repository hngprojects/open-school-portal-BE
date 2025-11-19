import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SessionParamsDto {
  @ApiProperty()
  @IsUUID()
  id: string;
}
