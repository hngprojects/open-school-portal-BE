import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import * as sysMsg from '../../../constants/system.messages';

export class CreateStreamDto {
  @ApiProperty({
    example: 'Gold',
    description: 'The name of the stream within the class (e.g. Gold, A, Blue)',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: sysMsg.STREAM_NAME_REQUIRED })
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'f8aca29c-9303-4b0e-8a45-25dc7282cf2b',
    description: 'ID of the parent class',
  })
  @IsUUID()
  @IsNotEmpty()
  class_id: string;
}
