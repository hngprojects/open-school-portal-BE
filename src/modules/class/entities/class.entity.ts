import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

import { ClassTeacher } from './class-teacher.entity';

@Entity()
export class Class extends BaseEntity {
  @Column()
  name: string; // e.g., "Grade 10"

  @Column({ nullable: true })
  stream: string; // e.g., "Science", "Arts", "Commerce"

  @OneToMany(() => ClassTeacher, (assignment) => assignment.class)
  teacher_assignment: ClassTeacher[];
}
