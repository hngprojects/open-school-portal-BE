import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Role name (must be unique per tenant)',
    minLength: 3,
    maxLength: 50,
    example: 'custom_role',
    name: 'name',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    maxLength: 255,
    example: 'Custom role for specific permissions',
    name: 'description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({
    description: 'List of permissions for this role',
    type: [String],
    example: ['users:read', 'users:write', 'reports:view'],
    name: 'permissions',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
