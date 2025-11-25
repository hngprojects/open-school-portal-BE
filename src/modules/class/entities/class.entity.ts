import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { AcademicSession } from '../../academic-session/entities/academic-session.entity';
import { Stream } from '../../stream/entities/stream.entity';

import { ClassTeacher } from './class-teacher.entity';

@Unique(['name', 'arm', 'academicSession'])
@Entity()
@Unique(['normalized_name', 'session_id'])
export class Class extends BaseEntity {
  @Column()
  session_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  stream?: string;

  @Column()
  normalized_name: string;

  @Column({ nullable: true })
  normalized_stream: string | null;

  @Column()
  arm: string;

  @ManyToOne(() => AcademicSession, { nullable: false })
  @JoinColumn({ name: 'academic_session_id' })
  academicSession: AcademicSession;

  @OneToMany(() => ClassTeacher, (assignment) => assignment.class)
  teacher_assignment: ClassTeacher[];

  @OneToMany(() => Stream, (stream) => stream.class)
  streams: Stream[];
}
