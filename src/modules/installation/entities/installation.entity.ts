import { IsEmail, IsString, Length } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity('superadmin')
export class SuperAdmin extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  @IsString()
  @Length(2, 150)
  full_name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  password: string;
}
