import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Student } from '../../student/entities/student.entity';
import { Class } from '../../class/entities/class.entity';
import { User } from '../../user/entities/user.entity';
import { DailyAttendanceStatus } from '../enums';

/**
 * Daily student attendance - one record per student per day
 * Tracks overall daily presence (morning register), not subject-specific
 */
@Entity('student_daily_attendance')
@Index(['student_id', 'class_id', 'date'], { unique: true })
@Index(['class_id'])
@Index(['student_id'])
@Index(['date'])
@Index(['session_id'])
export class StudentDailyAttendance extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ name: 'class_id', type: 'uuid' })
  class_id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  session_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: DailyAttendanceStatus,
    default: DailyAttendanceStatus.ABSENT,
  })
  status: DailyAttendanceStatus;

  @Column({ name: 'marked_by', type: 'uuid' })
  marked_by: string;

  @Column({ name: 'marked_at', type: 'timestamp', default: () => 'now()' })
  marked_at: Date;

  @Column({ type: 'time', nullable: true })
  check_in_time?: Date;

  @Column({ type: 'time', nullable: true })
  check_out_time?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student?: Student;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class?: Class;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'marked_by' })
  markedBy?: User;
}
