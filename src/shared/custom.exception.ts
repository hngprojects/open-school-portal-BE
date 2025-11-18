import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(response: string | Record<string, unknown>, status: HttpStatus) {
    super(response, status);
  }

  getResponse(): { message: string; success: boolean; errors?: unknown } {
    const response = super.getResponse();
    const status_code = this.getStatus();
    const success = status_code === 201 || status_code === 200 ? true : false;

    if (typeof response === 'object' && response !== null) {
      const res = response as Record<string, unknown>;
      return {
        message: (res.message || 'An error occurred') as string,
        errors: res.errors,
        success,
      };
    }

    return {
      message: response as string,
      success,
    };
  }
}
