import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsDate,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expires_at: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  @ApiProperty({ default: 'jwt' })
  @IsString()
  @IsOptional()
  provider?: string = 'jwt';

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  revoked_at?: Date;
}
