import { Controller, Get, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('auth')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get('sessions')
  async listSessions(@Query('userId') userId: string) {
    return this.sessionsService.getActiveSessions(userId);
  }
}
