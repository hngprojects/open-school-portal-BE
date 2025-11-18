import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserBodyValidator {
  @ApiProperty({
    example: '2f348eheiejso',
    description: 'User registration number',
  })
  @IsString()
  reg_no: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd',
    description: 'User password',
  })
  @IsString()
  password: string;
}
