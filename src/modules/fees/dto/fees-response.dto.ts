import { FeeType, FeeInterval, FeeStatus } from '../enums/fees.enum';

export class FeeResponseDto {
  id: string;
  title: string;
  description: string;
  amount: number;
  fee_type: FeeType;
  interval: FeeInterval;
  status: FeeStatus;
  currency: string;
  location: string;
  level: string;
  purpose: string;
  payment_method: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class FeeListResponseDto {
  fees: FeeResponseDto[];
  total: number;
  page?: number;
  limit?: number;
}

export class FeeStatsResponseDto {
  total_fees: number;
  total_amount: number;
  active_fees: number;
  inactive_fees: number;
}

export class CreateFeeResponseDto {
  message: string;
  data: FeeResponseDto;
}
