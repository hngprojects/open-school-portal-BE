import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @ApiProperty({
    description: 'New password for User (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

export class AdminResetPasswordResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({ example: 'Password has been reset successfully' })
  message: string;

  @ApiProperty({ example: '2024-03-20T10:30:00Z' })
  resetAt: Date;
}
