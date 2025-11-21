import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';

/**
 * Swagger documentation for Auth endpoints.
 *
 * @module Auth
 */

export const AuthSwagger = {
  /**
   * Swagger decorator for deactivate user account endpoint
   */
  deactivateUser: () =>
    applyDecorators(
      ApiBearerAuth(),
      ApiOperation({ summary: 'Deactivate user account' }),
      ApiResponse({
        status: HttpStatus.OK,
        description: sysMsg.USER_DEACTIVATED,
      }),
      ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: sysMsg.USER_NOT_FOUND,
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: sysMsg.TOKEN_INVALID,
      }),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: sysMsg.PERMISSION_DENIED,
      }),
    ),
};
