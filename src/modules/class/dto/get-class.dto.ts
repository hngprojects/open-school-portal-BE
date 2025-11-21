import { ApiProperty } from '@nestjs/swagger';

import { ClassLevel } from '../../shared/enums';

export class GetClassDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ClassLevel })
  level: ClassLevel;

  @ApiProperty()
  stream_count: number;

  @ApiProperty({ type: [String] })
  streams: string[];
}

export class GroupedClassesDto {
  @ApiProperty({ enum: ClassLevel })
  level: ClassLevel;

  @ApiProperty({ type: [GetClassDto] })
  classes: GetClassDto[];
}
