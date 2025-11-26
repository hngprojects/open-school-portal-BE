import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The name of the room',
    example: 'Room A',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The capacity of the room',
    example: 30,
    required: true,
  })
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiProperty({
    description: 'The location of the room',
    example: 'Main Building',
    required: true,
  })
  location?: string;

  @ApiProperty({
    description: 'The floor where the room is located',
    example: '2nd Floor',
    required: true,
  })
  floor?: string;

  @ApiProperty({
    description: 'The type of the room (e.g., classroom, lab, office)',
    example: 'Classroom',
    required: true,
  })
  room_type?: string;

  @ApiProperty({
    description: 'A brief description of the room',
    example: 'A spacious classroom with projector and whiteboard.',
    required: true,
  })
  description?: string;
}
