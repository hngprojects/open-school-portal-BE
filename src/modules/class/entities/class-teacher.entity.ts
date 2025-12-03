import { Entity, Column, CreateDateColumn } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

/**
 * @deprecated This entity is kept for historical data migration purposes only.
 * New implementations should use the direct teacher relationship on the Class entity.
 */
@Entity('class_teachers')
export class ClassTeacher extends BaseEntity {
  // FIX: explicitly map to 'session_id' and fix property casing
  @Column({ name: 'session_id' })
  session_id: string;

  @CreateDateColumn({ name: 'assignment_date' })
  assignment_date: Date;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'class_id' })
  class_id: string;

  @Column({ name: 'teacher_id' })
  teacher_id: string;

  // Relationships commented out - using direct relationship on Class now
  // @ManyToOne(() => Class, (cls) => cls.teacher)
  // @JoinColumn({ name: 'class_id' })
  // class: Class;

  // @ManyToOne(() => Teacher, (teacher) => teacher.classes)
  // @JoinColumn({ name: 'teacher_id' })
  // teacher: Teacher;
}
