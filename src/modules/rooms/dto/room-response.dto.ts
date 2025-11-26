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
