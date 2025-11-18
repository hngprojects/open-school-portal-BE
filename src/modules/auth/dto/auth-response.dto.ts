import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'User logged in successfully' })
  message: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;

  @ApiProperty({
    example: 'Invalid login credentials',
    description: 'Authentication error message',
    oneOf: [
      { example: 'Invalid login credentials' },
      { example: 'Invalid credentials' },
    ],
  })
  message: string;
}
