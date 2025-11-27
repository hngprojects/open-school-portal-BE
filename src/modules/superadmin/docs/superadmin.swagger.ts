import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import * as sysMsg from '../../../constants/system.messages';
import { SuperadminCreateResponseDto } from '../dto/create-superadmin-response.dto';
import { SuperadminLoginResponseDto } from '../dto/login-superadmin-response.dto';
import { SuperadminLogoutResponseDto } from '../dto/logout-superadmin-response.dto';

export const ApiCreateSuperadmin = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new superadmin' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: sysMsg.SUPERADMIN_ACCOUNT_CREATED,
      type: SuperadminCreateResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: sysMsg.SUPERADMIN_CONFLICT_GENERAL_MSG,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          // eslint-enable-next-line @typescript-eslint/naming-convention
          examples: {
            passwordsRequired: {
              summary: 'Passwords required',
              value: {
                statusCode: HttpStatus.CONFLICT,
                message: sysMsg.SUPERADMIN_PASSWORDS_REQUIRED,
              },
            },
            emailExists: {
              summary: 'Email already exists',
              value: {
                statusCode: HttpStatus.CONFLICT,
                message: sysMsg.SUPERADMIN_EMAIL_EXISTS,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: sysMsg.TOO_MANY_REQUESTS,
    }),
  );
};

export const ApiLoginSuperadmin = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Log in as a superadmin' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: sysMsg.LOGIN_SUCCESS,
      type: SuperadminLoginResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: sysMsg.SUPERADMIN_CONFLICT_GENERAL_MSG,
      content: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'application/json': {
          // eslint-enable-next-line @typescript-eslint/naming-convention
          examples: {
            invalidCredentials: {
              summary: 'Invalid credentials',
              value: {
                statusCode: HttpStatus.CONFLICT,
                message: sysMsg.INVALID_CREDENTIALS,
              },
            },
            userInActive: {
              summary: 'Account inactive',
              value: {
                statusCode: HttpStatus.CONFLICT,
                message: sysMsg.USER_INACTIVE,
              },
            },
            inValidPassword: {
              summary: 'Incorrect password',
              value: {
                statusCode: HttpStatus.CONFLICT,
                message: sysMsg.SUPERADMIN_INVALID_PASSWORD,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: sysMsg.TOO_MANY_REQUESTS,
    }),
  );
};

export const ApiLogoutSuperadmin = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Log out as a superadmin' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: sysMsg.LOGOUT_SUCCESS,
      type: SuperadminLogoutResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: sysMsg.TOO_MANY_REQUESTS,
    }),
  );
};
