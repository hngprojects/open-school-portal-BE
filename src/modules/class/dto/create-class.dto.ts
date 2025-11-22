import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';

import * as sysMsg from '../../../constants/system.messages';
import { ClassLevel } from '../../shared/enums';

export class CreateClassDto {
  @ApiProperty({ example: 'JSS2', description: 'Name of the class' })
  @IsString()
  @IsNotEmpty({ message: sysMsg.CLASS_NAME_REQUIRED })
  @MaxLength(100, { message: sysMsg.CLASS_NAME_TOO_LONG })
  @Matches(/^[A-Za-z0-9 ]+$/, {
    message: sysMsg.CLASS_NAME_INVALID,
  })
  class_name: string;

  @ApiProperty({
    enum: ClassLevel,
    example: 'Junior Secondary',
    description: 'Level/category of the class',
  })
  @IsNotEmpty({ message: sysMsg.CLASS_LEVEL_REQUIRED })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Find matching enum value case-insensitively
      const match = Object.values(ClassLevel).find(
        (enumVal) => enumVal.toLowerCase() === value.toLowerCase(),
      );
      return match || value;
    }
    return value;
  })
  @IsEnum(ClassLevel, { message: sysMsg.CLASS_LEVEL_INVALID })
  level: ClassLevel;
}

export class ClassResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ClassLevel })
  level: ClassLevel;
}
