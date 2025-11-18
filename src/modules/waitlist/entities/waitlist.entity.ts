import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity('waitlist')
export class Waitlist extends BaseEntity {
  @Column({ type: 'varchar', length: 120 })
  first_name: string;

  @Column({ type: 'varchar', length: 120 })
  last_name: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  email: string;
}
