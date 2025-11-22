import { HttpStatus } from '@nestjs/common';

export interface IServiceResponse<t = unknown> {
  message: string;
  data?: t;
  error?: string;
  statusCode: HttpStatus;
  method: string;
  path: string;
  timestamp?: string;
}

export const response_template = (
  message: string,
  data: unknown,
  error: string,
  statusCode: HttpStatus,
  method: string,
  path: string,
  timestamp: string,
): IServiceResponse => {
  return {
    message,
    data,
    error,
    statusCode,
    method,
    path,
    timestamp,
  };
};
