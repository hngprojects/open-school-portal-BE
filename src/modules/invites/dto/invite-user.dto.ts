import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';

import { PendingInviteDto } from './pending-invite.dto';

export enum InviteRole {
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export class InviteUserDto {
  @ApiProperty({ example: 'parent@example.com' })
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Please provide a valid email address',
  })
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
}

export class CreatedInviteDto extends PendingInviteDto {
  @ApiProperty({ enum: InviteRole, example: InviteRole.TEACHER })
  readonly role: InviteRole;

  @ApiProperty({ example: 'Olivia' })
  readonly first_name: string;

  @ApiProperty({ example: 'Doe' })
  readonly last_name: string;

  @ApiPropertyOptional({ example: 'pending' })
  readonly status?: string;
}

export class CreatedInvitesResponseDto {
  @ApiProperty({ example: 200 })
  status_code: number;

  @ApiProperty({ example: 'Invite sent successfully' })
  message: string;

  @ApiProperty({ type: [CreatedInviteDto] })
  data: CreatedInviteDto[];
}
