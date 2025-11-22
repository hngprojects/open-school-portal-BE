import { Entity, Column, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Class } from '../../class/entities/class.entity';

export enum SessionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('academic_sessions')
export class AcademicSession extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.INACTIVE,
  })
  status: SessionStatus;

  @OneToMany(() => Class, (classEntity) => classEntity.academicSession)
  classes: Class[];
}
