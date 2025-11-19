import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Teacher } from '../../teacher/entities/teacher.entity';

import { Class } from './classes.entity';

@Entity('class_teachers')
export class ClassTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string; // Links to a Session entity (not shown)

  @CreateDateColumn()
  assignment_date: Date;

  @Column({ default: true })
  is_active: boolean;

  @ManyToOne(() => Class, (cls) => cls.teacher_assignment)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => Teacher, (teacher) => teacher.class_assignments)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
