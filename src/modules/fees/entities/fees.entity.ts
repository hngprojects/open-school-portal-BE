import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../../entities/base-entity';
import { FeeInterval, FeeStatus, FeeType } from '../enums/fees.enum';

@Entity('fees')
export class Fee extends BaseEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @Column({ type: 'enum', enum: FeeType })
  @IsEnum(FeeType)
  @IsNotEmpty()
  fee_type: FeeType;

  @Column({ type: 'enum', enum: FeeInterval })
  @IsEnum(FeeInterval)
  @IsNotEmpty()
  interval: FeeInterval;

  @Column({ type: 'enum', enum: FeeStatus, default: FeeStatus.ACTIVE })
  @IsEnum(FeeStatus)
  status: FeeStatus;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  payment_method: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  purpose: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @IsOptional()
  date_paid: Date;

  @Column()
  @IsString()
  @IsNotEmpty()
  created_by: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  paid_by: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  location: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  level: string;

  @Column({ default: 'NGN' })
  @IsString()
  currency: string;
}
