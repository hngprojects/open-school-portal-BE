import { ClassResponseDto } from '../dto/create-class.dto';

export interface ICreateClassResponse {
  status_code: number;
  message: string;
  data: ClassResponseDto;
}

export interface IUpdateClassResponse {
  message: string;
  id: string;
  name: string;
  arm?: string;
  academicSession: {
    id: string;
    name: string;
  };
}
