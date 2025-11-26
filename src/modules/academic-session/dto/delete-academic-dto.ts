import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAcademicSessionDto {
  @ApiProperty({
    description: 'ID of the academic session to delete',
    example: '1',
  })
  @IsNotEmpty({ message: 'Session id is required.' })
  @IsString({ message: 'Session id must be a string' })
  id: string;
}
