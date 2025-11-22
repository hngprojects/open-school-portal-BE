import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class ActivateAcademicSessionDto {
  @ApiProperty({
    description: 'The UUID of the session to activate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Academic Session ID is required' })
  session_id: string;
}
