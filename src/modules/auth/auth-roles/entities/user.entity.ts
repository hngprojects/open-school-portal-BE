import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  first_name: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  last_name: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  password_hash: string;

  @Column({
    name: 'tenant_id',
    type: 'uuid',
  })
  tenant_id: string;

  @Column({
    name: 'role_id',
    type: 'uuid',
    nullable: true,
  })
  role_id: string;

  @ManyToOne(() => Role, (role) => role.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  is_active: boolean;
}
