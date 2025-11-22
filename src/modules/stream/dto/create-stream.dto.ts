import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStreamDto {
  @ApiProperty({
    example: 'A',
    description: 'The name of the stream within the class',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
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
