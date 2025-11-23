import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateInstallationDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
