import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsEnum,
  IsUUID,
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

  @ApiProperty({
    example: 'c438779a-514a-47e1-9596-b21e0bf87334',
    description: 'Academic session ID',
  })
  @IsUUID('4', { message: 'Invalid academic session ID' })
  academic_session_id: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'b1a2c3d4-5678-1234-9876-abcdefabcdef',
      'e2f3a4b5-6789-2345-8765-fedcbafedcba',
    ],
    description: 'List of stream UUIDs to associate with the class (optional)',
  })
  @IsUUID('4', { each: true, message: 'Each stream must be a valid UUID' })
  streams?: string[];
}

export class ClassResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ClassLevel })
  level: ClassLevel;

  @ApiProperty({
    example: {
      id: 'c438779a-514a-47e1-9596-b21e0bf87334',
      name: '2024-2025',
    },
    description: 'Academic session for the class',
    required: true,
  })
  academicSession: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'b1a2c3d4-5678-1234-9876-abcdefabcdef' },
        name: { type: 'string', example: 'Science' },
      },
    },
    example: [
      { id: 'b1a2c3d4-5678-1234-9876-abcdefabcdef', name: 'Science' },
      { id: 'e2f3a4b5-6789-2345-8765-fedcbafedcba', name: 'Arts' },
    ],
    description:
      'List of streams (id and name) associated with the class (optional)',
  })
  streams?: Array<{ id: string; name: string }>;
}
