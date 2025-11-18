import { ApiProperty } from '@nestjs/swagger';

class ValidationErrors {
  @ApiProperty({
    example: [
      'password is not strong enough',
      'password must be longer than or equal to 8 characters',
    ],
  })
  password?: string[];

  @ApiProperty({ example: ['Username is required'] })
  username?: string[];
}

export class ValidationResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation error' })
  message: string;

  @ApiProperty({ type: ValidationErrors })
  errors: ValidationErrors;
}
