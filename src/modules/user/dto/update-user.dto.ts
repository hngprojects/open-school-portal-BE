import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsString()
  @IsOptional()
  gender: string;

  @IsString()
  @IsOptional()
  dob: string;
}
