import { Entity, Column, OneToMany, Unique } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Stream } from '../../stream/entities/stream.entity';

import { ClassTeacher } from './class-teacher.entity';

export enum ClassLevel {
  NURSERY = 'Nursery',
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

@Entity()
@Unique(['normalized_name'])
export class Class extends BaseEntity {
  @Column()
  name: string;

  @Column()
  normalized_name: string;

  @Column({ type: 'enum', enum: ClassLevel })
  level: ClassLevel;

  @OneToMany(() => ClassTeacher, (assignment) => assignment.class)
  teacher_assignment: ClassTeacher[];

  @OneToMany(() => Stream, (stream) => stream.class)
  streams: Stream[];
}
