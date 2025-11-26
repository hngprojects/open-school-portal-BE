import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';

@Entity()
export class Room extends BaseEntity {
  // Define room properties here
  @Column({ unique: true })
  name: string;

  @Column({ nullable: false })
  capacity?: number;

  @Column({ nullable: false })
  location?: string;

  @Column({ nullable: false })
  floor?: string;

  @Column({ nullable: false })
  room_type?: string;
}
