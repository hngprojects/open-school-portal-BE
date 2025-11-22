import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

import { AcademicSession } from './academic-session.entity';

@Entity('session_streams')
@Unique(['session_id', 'stream_name'])
export class SessionStream extends BaseEntity {
  @Column({ name: 'session_id' })
  session_id: string;

  @ManyToOne(() => AcademicSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: AcademicSession;

  @Column({ name: 'stream_name', type: 'varchar', length: 100 })
  stream_name: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  deleted_at: Date | null;
}
