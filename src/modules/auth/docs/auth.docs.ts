import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ValidationResponseDto } from '../../../shared/docs-response.dto';
import { UnauthorizedResponseDto, LoginDto } from '../dto/auth-response.dto';
import { LoginUserBodyValidator } from '../validators/login-user.validator';

export class AuthDocs {
  static login() {
    return applyDecorators(
      ApiOperation({ summary: 'User Login' }),
      ApiBody({ type: LoginUserBodyValidator }),
      ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: LoginDto,
      }),
      ApiUnauthorizedResponse({
        description: 'Invalid login credentials',
        type: UnauthorizedResponseDto,
      }),
      ApiResponse({
        status: 422,
        description: 'Validation error',
        type: ValidationResponseDto,
      }),
    );
  }
}
