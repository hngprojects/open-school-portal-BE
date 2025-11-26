import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity()
export class Room extends BaseEntity {
  // Define room properties here
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  capacity?: number;
}
