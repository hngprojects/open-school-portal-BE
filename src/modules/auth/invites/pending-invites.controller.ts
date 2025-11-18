import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PendingInvitesService } from './pending-invites.service';
import { PendingInvitesResponseDto } from '../dtos/pending-invite.dto';

@ApiTags('Invites')
@Controller('auth/pending-invites')
export class PendingInvitesController {
  constructor(private readonly pendingInvitesService: PendingInvitesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all pending invites' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns pending invites',
    type: PendingInvitesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No pending invites found',
    type: PendingInvitesResponseDto,
  })
  async getPendingInvites(): Promise<PendingInvitesResponseDto> {
    return this.pendingInvitesService.getPendingInvites();
  }
}
