import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { Class } from '../../class/entities/class.entity';
import { FeeStatus, Term } from '../enums/fees.enums';

@Entity('fees')
export class Fees extends BaseEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  component_name: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  // TODO: Replace enums with Term table when get all terms endpoint is ready
  @Column({ type: 'enum', enum: Term })
  @IsEnum(Term)
  @IsNotEmpty()
  term: Term;

  @ManyToMany(() => Class)
  @JoinTable({
    name: 'fee_classes',
    joinColumn: { name: 'fee_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'class_id', referencedColumnName: 'id' },
  })
  classes: Class[];

  @Column({ type: 'enum', enum: FeeStatus, default: FeeStatus.ACTIVE })
  @IsEnum(FeeStatus)
  status: FeeStatus;

  @Column()
  @IsString()
  @IsNotEmpty()
  created_by: string;
}
