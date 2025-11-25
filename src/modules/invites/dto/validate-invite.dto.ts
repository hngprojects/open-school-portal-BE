import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidateInviteDto {
  @IsString()
  @Length(10, 200)
  token: string;
}

export class ValidateInviteResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: 'Token is valid' })
  reason: string;

  @ApiProperty({ example: 'Token validated successfully' })
  message: string;

  @ApiProperty({
    required: false,
    example: {
      invite_id: 'uuid-123',
      email: 'teacher@example.com',
      role: 'teacher',
      expires_at: '2025-11-25T09:00:00.000Z',
      full_name: 'John Doe',
    },
  })
  data?: {
    invite_id: string;
    email: string;
    role: string;
    expires_at: Date;
    full_name: string;
  };
}
