import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

export enum RoleName {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ type: 'enum', enum: RoleName, unique: true })
  name: RoleName;

  @Column({ type: 'text', nullable: true })
  permissions: string; // stored as JSON string
}
