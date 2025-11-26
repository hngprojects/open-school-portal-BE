import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../shared/enums';

import {
  ApiInvitationsTags,
  ApiSendInvite,
  ApiValidateInvite,
  ApiGetPendingInvites,
} from './docs/invitations.swagger';
import { InviteUserDto } from './dto/invite-user.dto';
import { PendingInvitesResponseDto } from './dto/pending-invite.dto';
import {
  ValidateInviteDto,
  ValidateInviteResponseDto,
} from './dto/validate-invite.dto';
import { InviteService } from './invites.service';

@Controller('invitations')
@ApiInvitationsTags()
export class InvitesController {
  constructor(private readonly inviteService: InviteService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiSendInvite()
  async inviteUser(@Body() payload: InviteUserDto) {
    return this.inviteService.sendInvite(payload);
  }

  @Get('validate')
  @HttpCode(HttpStatus.OK)
  @ApiValidateInvite()
  async validateInviteToken(
    @Query() dto: ValidateInviteDto,
  ): Promise<ValidateInviteResponseDto> {
    return this.inviteService.validateInviteToken(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiGetPendingInvites()
  async getPendingInvites(): Promise<PendingInvitesResponseDto> {
    return this.inviteService.getPendingInvites();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiGetPendingInvites()
  async getAcceptedInvites(): Promise<PendingInvitesResponseDto> {
    return this.inviteService.getAcceptedInvites();
  }
}
