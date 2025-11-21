import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateInstallationDto {
  @ApiProperty({
    description: 'School name',
    example: 'St. Mary International School',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  school_name: string;

  @ApiProperty({
    description: 'Primary brand color in hex format',
    example: '#1E40AF',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'primary_color must be a valid hex color code (e.g., #1E40AF)',
  })
  primary_color?: string;

  @ApiProperty({
    description: 'Secondary brand color in hex format',
    example: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'secondary_color must be a valid hex color code (e.g., #3B82F6)',
  })
  secondary_color?: string;

  @ApiProperty({
    description: 'Accent brand color in hex format',
    example: '#60A5FA',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'accent_color must be a valid hex color code (e.g., #60A5FA)',
  })
  accent_color?: string;
}
