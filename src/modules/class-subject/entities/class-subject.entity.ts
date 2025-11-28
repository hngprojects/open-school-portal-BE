import { Entity, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Class } from '../../class/entities/class.entity';
import { Subject } from '../../subject/entities/subject.entity';

@Entity('class_subject_assignments')
@Unique(['class', 'subject'])
export class ClassSubject extends BaseEntity {
  @ManyToOne(() => Class, (cls) => cls.classSubjects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  class: Class;

  @ManyToOne(() => Subject, (subject) => subject.classSubjects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  subject: Subject;
}
