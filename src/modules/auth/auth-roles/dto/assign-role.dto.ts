import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'UUID of the role to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
    name: 'role_id',
  })
  @IsNotEmpty()
  @IsUUID()
  role_id: string;
}
