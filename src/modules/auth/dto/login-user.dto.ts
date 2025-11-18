import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'User identificaation number',
    description: 'User identificaation number for login',
    required: true,
  })
  reg_no: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password for authentication',
    required: true,
  })
  password: string;
}
