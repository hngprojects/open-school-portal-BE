import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserRole } from '../../../user/dto/create-user.dto';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'The new role to assign to the user',
    example: 'ADMIN',
    enum: UserRole,
  })
  @IsEnum(UserRole, {
    message: 'Role must be one of: ADMIN, TEACHER, STUDENT, PARENT',
  })
  @IsNotEmpty()
  role: UserRole;
}
