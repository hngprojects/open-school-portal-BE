import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { AcademicSession } from '../../academic-session/entities/academic-session.entity';
import { Stream } from '../../stream/entities/stream.entity';
import { Teacher } from '../../teacher/entities/teacher.entity';
import { Timetable } from '../../timetable/entities/timetable.entity';

import { ClassStudent } from './class-student.entity';
import { ClassSubject } from './class-subject.entity';

@Unique(['name', 'arm', 'academicSession'])
@Entity()
export class Class extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  stream?: string;

  @Column({ nullable: true })
  arm?: string;

  @ManyToOne(() => AcademicSession, { nullable: false })
  @JoinColumn({ name: 'academic_session_id' })
  academicSession: AcademicSession;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: Teacher;

  @OneToMany(() => ClassStudent, (assignment) => assignment.class)
  student_assignments: ClassStudent[];

  @OneToMany(() => Stream, (stream) => stream.class)
  streams: Stream[];

  @OneToOne(() => Timetable, (timetable) => timetable.class)
  timetable?: Timetable;

  @OneToMany(() => ClassSubject, (cs) => cs.class)
  classSubjects: ClassSubject[];

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
