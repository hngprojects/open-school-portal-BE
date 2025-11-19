import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  // UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// import { UserRole } from '../../user/entities/user.entity';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SessionParamsDto } from './dto/session-params.dto';
import { SessionStatisticsResponseDto } from './dto/session-statistics-response.dto';
import { SessionsStatisticsService } from './session-statistics.service';

// import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('academic-sessions')
@ApiBearerAuth()
@Controller('academic-sessions')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsStatisticsController {
  constructor(
    private readonly sessionsStatisticsService: SessionsStatisticsService,
  ) {}

  @Get(':id/statistics')
  @HttpCode(HttpStatus.OK)
  // @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get academic session statistics',
    description:
      'Retrieve comprehensive statistics for a specific academic session including class, stream, student, and teacher counts. Requires admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session statistics retrieved successfully',
    type: SessionStatisticsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have required role',
  })
  @ApiResponse({
    status: 404,
    description: 'Academic session not found',
  })
  async getSessionStatistics(
    @Param() params: SessionParamsDto,
  ): Promise<SessionStatisticsResponseDto> {
    return this.sessionsStatisticsService.getSessionStatistics(params.id);
  }
}
