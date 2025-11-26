import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum InviteRole {
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export class InviteUserDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: InviteRole,
    example: InviteRole.TEACHER,
  })
  @IsEnum(InviteRole)
  role: InviteRole;

  @ApiProperty({ example: 'Olivia' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @IsOptional()
  @IsUUID()
  school_id?: string;
}
