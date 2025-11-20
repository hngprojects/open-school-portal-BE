import {
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';

import {
  RevokeSessionDto,
  RevokeAllSessionsDto,
} from './dto/session-revoke.dto';
import { SessionService } from './session.service';

@ApiTags('Authentication')
@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all active sessions for a user' })
  @ApiOkResponse({ description: 'User sessions retrieved successfully' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sessionService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiOkResponse({ description: 'Session retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.findOne(id);
  }

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiOkResponse({
    description: 'Session revoked successfully',
    type: ApiSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (uuid is expected)',
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
  })
  async revokeSession(@Body() revokeSessionDto: RevokeSessionDto) {
    return this.sessionService.revokeSession(
      revokeSessionDto.session_id,
      revokeSessionDto.user_id,
    );
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions for a user' })
  @ApiOkResponse({
    description: 'All sessions revoked successfully',
    type: ApiSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (uuid is expected)',
  })
  async revokeAllSessions(@Body() revokeAllSessionsDto: RevokeAllSessionsDto) {
    return this.sessionService.revokeAllUserSessions(
      revokeAllSessionsDto.user_id,
      revokeAllSessionsDto.exclude_current,
    );
  }
}
