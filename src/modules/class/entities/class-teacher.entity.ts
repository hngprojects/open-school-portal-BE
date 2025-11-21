import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Teacher } from '../../teacher/entities/teacher.entity';

import { Class } from './class.entity';

@Entity('class_teachers')
export class ClassTeacher extends BaseEntity {
  @Column({ name: 'session_id' })
  session_id: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @ManyToOne(() => Class, (cls) => cls.teacher_assignment)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => Teacher, (teacher) => teacher.class_assignments)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
