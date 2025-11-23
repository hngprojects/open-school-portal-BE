import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

import { ClassTeacher } from './class-teacher.entity';

@Entity()
export class Class extends BaseEntity {
  @Column()
  session_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  stream?: string;

  @OneToMany(() => ClassTeacher, (assignment) => assignment.class)
  teacher_assignment: ClassTeacher[];
}
