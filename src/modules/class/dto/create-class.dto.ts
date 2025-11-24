import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { ClassLevel } from '../entities/class.entity';

export class CreateClassDto {
  @ApiProperty({
    example: ClassLevel.PRIMARY,
    enum: ClassLevel,
    description:
      'The level/category of the class. Must be Nursery, Primary, or Secondary.',
  })
  @IsNotEmpty({ message: 'Level/category is required' })
  @IsString()
  @Matches(/^(Nursery|Primary|Secondary)$/, {
    message: 'Level must be Nursery, Primary, or Secondary',
  })
  level: ClassLevel;

  @ApiProperty({
    example: 'SSS 2',
    description: 'The name of the class. Letters, numbers, and spaces only.',
  })
  @IsNotEmpty({ message: 'Class name cannot be empty' })
  @Matches(/^[a-zA-Z0-9 ]+$/, {
    message: 'Class name can only contain letters, numbers, and spaces',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  name: string;
}

export class ClassResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ClassLevel })
  level: ClassLevel;
}
