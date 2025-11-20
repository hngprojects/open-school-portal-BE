import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Class } from '../../classes/entities/classes.entity';

@Entity('stream')
@Index(['class_id'])
@Unique(['class_id', 'name'])
export class Stream extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'class_id', type: 'uuid' })
  class_id: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.stream, {
    onDelete: 'CASCADE', // If the class is deleted, all related streams will be deleted
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;
}
