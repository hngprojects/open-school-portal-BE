import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { UserRole } from '../../shared/enums';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: false })
  reg_no: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  dob?: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;
}
