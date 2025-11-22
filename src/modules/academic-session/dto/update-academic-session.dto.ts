import { ApiProperty } from '@nestjs/swagger';

import { CreateAcademicSessionDto } from './create-academic-session.dto';

export class UpdateAcademicSessionDto extends CreateAcademicSessionDto {}

export class UpdateAcademicSessionResponseDto {
  @ApiProperty({
    example: '200',
    nullable: false,
  })
  status_code: number;

  @ApiProperty({
    example: 'Academic session updated successfully',
    nullable: false,
  })
  message: string;

  @ApiProperty({
    example: '2024/2025',
    nullable: false,
  })
  name: string;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    nullable: false,
  })
  startDate: Date;

  @ApiProperty({
    example: '2025-01-15T10:30:00Z',
    nullable: false,
  })
  endDate: Date;
}
