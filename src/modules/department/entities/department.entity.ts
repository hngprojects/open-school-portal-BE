import { Entity, Column, ManyToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Subject } from '../../subject/entities/subject.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @ManyToMany(() => Subject, (subject) => subject.departments)
  subjects: Subject[];
}
