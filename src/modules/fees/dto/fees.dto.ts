import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { FeeType, FeeInterval, FeeStatus } from '../enums/fees.enum';

export class CreateFeeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsEnum(FeeType)
  @IsNotEmpty()
  fee_type: FeeType;

  @IsEnum(FeeInterval)
  @IsNotEmpty()
  interval: FeeInterval;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;
}

export class UpdateFeeDto extends PartialType(CreateFeeDto) {
  @IsEnum(FeeStatus)
  @IsOptional()
  status?: FeeStatus;
}

export class QueryFeeDto {
  @IsEnum(FeeType)
  @IsOptional()
  fee_type?: FeeType;

  @IsEnum(FeeStatus)
  @IsOptional()
  status?: FeeStatus;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
