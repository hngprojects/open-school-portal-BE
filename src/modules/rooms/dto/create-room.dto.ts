import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The name of the room',
    example: 'Room A',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The capacity of the room',
    example: 30,
    required: false,
  })
  @IsInt()
  @Min(1)
  capacity?: number;
}
