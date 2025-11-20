import {
  Controller,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  ParseUUIDPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '../../common/dto/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import {
  RevokeSessionDto,
  RevokeAllSessionsDto,
} from './dto/session-revoke.dto';
import { SessionService } from './session.service';

@ApiBearerAuth('access-token')
@ApiTags('Authentication')
@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  @ApiOperation({ summary: 'Get all active sessions for the current user' })
  @ApiOkResponse({ description: 'User sessions retrieved successfully' })
  async findByUserId(@Request() req) {
    return this.sessionService.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiOkResponse({ description: 'Session retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Session not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
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
  async revokeSession(
    @Request() req,
    @Body() revokeSessionDto: RevokeSessionDto,
  ) {
    return this.sessionService.revokeSession(
      revokeSessionDto.session_id,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
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
  async revokeAllSessions(
    @Request() req,
    @Body() revokeAllSessionsDto: RevokeAllSessionsDto,
  ) {
    const currentSessionId = req.user.sessionId;
    const excludeSessionId = revokeAllSessionsDto.exclude_current
      ? currentSessionId
      : undefined;
    return this.sessionService.revokeAllUserSessions(
      req.user.userId,
      excludeSessionId,
    );
  }
}
