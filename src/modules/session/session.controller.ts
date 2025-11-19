import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BaseResponse } from '../../common/types/base-response.interface';
import * as SYS_MSG from '../../constants/system.messages';

import {
  RevokeSessionDto,
  RevokeAllSessionsDto,
} from './dto/session-revoke.dto';
import {
  RevokeSessionData,
  RevokeAllSessionsData,
} from './interface/session-response.interface';
import { SessionService } from './session.service';

@ApiTags('Authentication')
@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly session_service: SessionService) {}

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session successfully revoked',
    schema: {
      example: {
        status_code: 200,
        message: 'Session revoked successfully',
        data: { session_id: '...', user_id: '...', revoked: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
    schema: {
      example: {
        status_code: 404,
        message: 'Session not found',
        data: { session_id: '...', user_id: '...', revoked: false },
      },
    },
  })
  async revoke_session(
    @Body() revoke_session_dto: RevokeSessionDto,
  ): Promise<BaseResponse<RevokeSessionData>> {
    const result = await this.session_service.revoke_session(
      revoke_session_dto.session_id,
      revoke_session_dto.user_id,
    );
    if (!result.revoked) {
      throw new NotFoundException(SYS_MSG.SESSION_NOT_FOUND);
    }
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.SESSION_REVOKED,
      data: result,
    };
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions for a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions successfully revoked',
    schema: {
      example: {
        status_code: 200,
        message: 'All sessions revoked successfully',
        data: { user_id: '...', revoked_count: 3 },
      },
    },
  })
  async revoke_all_sessions(
    @Body() revoke_all_sessions_dto: RevokeAllSessionsDto,
  ): Promise<BaseResponse<RevokeAllSessionsData>> {
    const result = await this.session_service.revoke_all_user_sessions(
      revoke_all_sessions_dto.user_id,
      revoke_all_sessions_dto.exclude_current,
    );
    return {
      status_code: HttpStatus.OK,
      message: SYS_MSG.SESSIONS_REVOKED,
      data: result,
    };
  }
}
