export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface ICreateClassResponse {
  message: string;
  id: string;
  name: string;
  arm?: string;
  academicSession: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    employment_id: string;
  } | null;
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
  teacher: {
    id: string;
    name: string;
    employment_id: string;
  } | null;
}

export interface IGetClassByIdResponse {
  message: string;
  id: string;
  name: string;
  arm?: string;
  is_deleted: boolean;
  academicSession: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    name: string;
    employment_id: string;
  } | null;
}
