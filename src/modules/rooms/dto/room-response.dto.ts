import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RoomResponseDto {
  @ApiProperty({
    example: 'Conference Room A',
    description: 'Name of the room',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    example: 50,
    description: 'Capacity of the room',
  })
  @Expose()
  capacity?: number;

  @ApiPropertyOptional({
    example: 'Main Building',
    description: 'Location of the room',
  })
  @Expose()
  location?: string;

  @ApiPropertyOptional({
    example: '2nd Floor',
    description: 'Floor where the room is located',
  })
  @Expose()
  floor?: string;

  @ApiPropertyOptional({
    example: 'Classroom',
    description: 'Type of the room (e.g., classroom, lab, office)',
  })
  @Expose({ name: 'room_type' })
  roomType?: string;

  @ApiPropertyOptional({
    example: 'A spacious classroom with projector and whiteboard.',
    description: 'Description of the room',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    example: '2023-10-01T12:00:00Z',
    description: 'Date and time when the room was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-10-10T15:30:00Z',
    description: 'Date and time when the room was last updated',
  })
  @Expose()
  updatedAt: Date;
}
