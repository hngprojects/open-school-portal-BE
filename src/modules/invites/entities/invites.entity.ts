import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { School } from '../../school/entities/school.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

@Entity({ name: 'invites' })
export class Invite extends BaseEntity {
  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING,
  })
  status: InviteStatus;

  @Column()
  token_hash: string;

  @CreateDateColumn()
  invited_at: Date;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column()
  role: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  school_id: string;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school: School;
}
