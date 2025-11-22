import { ApiProperty } from '@nestjs/swagger';

export class AcademicSessionLinkCountsDto {
  @ApiProperty({ description: 'Number of classes linked' })
  classes_linked: number;

  @ApiProperty({ description: 'Number of streams linked' })
  streams_linked: number;
}

export class ActivateAcademicSessionResponseDto {
  @ApiProperty()
  status_code: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AcademicSessionLinkCountsDto })
  data: AcademicSessionLinkCountsDto;
}
