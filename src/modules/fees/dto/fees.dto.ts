import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
} from 'class-validator';

import { FeeStatus } from '../enums/fees.enums';

export class CreateFeesDto {
  @IsString()
  @IsNotEmpty()
  component_name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  term_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  class_ids: string[];
}

export class UpdateFeesDto extends PartialType(CreateFeesDto) {
  @IsEnum(FeeStatus)
  @IsOptional()
  status?: FeeStatus;
}

export class QueryFeesDto {
  @IsEnum(FeeStatus)
  @IsOptional()
  status?: FeeStatus;

  @IsString()
  @IsOptional()
  class_id?: string;

  @IsString()
  @IsOptional()
  term_id?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
