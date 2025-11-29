import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectSubmissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  reason: string;
}
