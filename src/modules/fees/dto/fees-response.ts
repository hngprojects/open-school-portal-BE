import { Term, FeeStatus } from '../enums/fees.enums';

export class FeesResponseDto {
  id: string;
  component_name: string;
  description: string;
  amount: number;
  term: Term;
  classes: Array<{
    id: string;
    name: string;
  }>;
  status: FeeStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class FeesListResponseDto {
  fees: FeesResponseDto[];
  total: number;
  page?: number;
  limit?: number;
}

export class CreateFeeResponseDto {
  message: string;
  data: FeesResponseDto;
}
