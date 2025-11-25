import { Entity, Column, CreateDateColumn } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

export enum InviteStatus {
  PENDING = 'pending',
  USED = 'used',
  EXPIRED = 'expired',
  FAILED = 'failed',
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

  @Column({ nullable: true })
  full_name: string;
}
