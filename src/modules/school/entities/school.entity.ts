import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity({ name: 'schools' })
export class School extends BaseEntity {
  @Column({ unique: true })
  school_name: string;

  @Column({ nullable: true })
  logo_url: string;

  @Column({ nullable: true })
  primary_color: string;

  @Column({ nullable: true })
  secondary_color: string;

  @Column({ nullable: true })
  accent_color: string;

  @Column({ default: false })
  installation_completed: boolean;
}
