import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ nullable: false })
  reg_no: string;

  @Column({ nullable: true })
  password: string;
}
