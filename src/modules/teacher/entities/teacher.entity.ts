import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { ClassTeacher } from '../../classes/entities/class-teacher.entity';
import { User } from '../../user/entities/user.entity';
import { TeacherTitle } from '../enums/teacher.enum';

@Entity('teachers')
export class Teacher extends BaseEntity {
  @PrimaryGeneratedColumn()
  // @ts-expect-error - Teacher uses numeric ID instead of UUID from BaseEntity
  declare id: number;

  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string; // Foreign key to User entity

  @Column({ unique: true, name: 'employment_id' })
  employmentId: string; // e.g., EMP-2025-014

  @Column({ type: 'enum', enum: TeacherTitle })
  title: TeacherTitle; // Mr, Mrs, Miss, Dr, Prof

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string; // Path to 150x150 image

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean; // For setting a teacher as active or inactive

  // --- Relationships ---
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => ClassTeacher, (assignment) => assignment.teacher)
  class_assignments: ClassTeacher[];
}
