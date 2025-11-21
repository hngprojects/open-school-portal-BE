import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { ClassLevel } from '../../shared/enums';
import { Stream } from '../../stream/entities/stream.entity';

import { ClassTeacher } from './class-teacher.entity';

@Entity('classes')
export class Class extends BaseEntity {
  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ClassLevel })
  level: ClassLevel;

  @OneToMany(() => Stream, (stream) => stream.class)
  streams: Stream[];

  @OneToMany(() => ClassTeacher, (assignment) => assignment.class)
  teacher_assignment: ClassTeacher[];
}
