import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateRoomDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsArray({ message: 'Streams must be provided as an array' })
  @ArrayNotEmpty({ message: 'If providing streams, the list cannot be empty' })
  @IsUUID('4', { each: true, message: 'Invalid Stream ID provided' })
  streams?: string[];
}
