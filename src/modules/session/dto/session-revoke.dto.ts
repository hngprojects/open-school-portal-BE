import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RevokeSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  session_id!: string;
}

export class RevokeAllSessionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  exclude_current?: boolean;
}
