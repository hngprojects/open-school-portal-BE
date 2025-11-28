import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateClassSubjectDto {
  @ApiProperty({ description: 'The name of the class' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'className cannot be empty or contain only whitespace',
  })
  className: string;

  @ApiProperty({ description: 'The arm of the class' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'arm cannot be empty or contain only whitespace' })
  arm: string;

  @ApiProperty({ description: 'The name of the subject' })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'subjectName cannot be empty or contain only whitespace',
  })
  subjectName: string;
}
