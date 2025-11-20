import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class RevokeSessionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  session_id!: string;
}

export class RevokeAllSessionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  exclude_current?: boolean;
}
