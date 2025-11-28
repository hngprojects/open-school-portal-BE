import { ApiProperty } from '@nestjs/swagger';

import { Class } from '../../class/entities/class.entity';
import { Subject } from '../../subject/entities/subject.entity';

export class ClassSubjectResponseDto {
  @ApiProperty({ description: 'The ID of the class' })
  classId: number;

  @ApiProperty({ description: 'The ID of the subject' })
  subjectId: number;

  @ApiProperty({ type: Class })
  class: Class;

  @ApiProperty({ type: Subject })
  subject: Subject;
}
