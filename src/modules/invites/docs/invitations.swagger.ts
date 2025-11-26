import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { InviteUserDto } from '../dto/invite-user.dto';
import { PendingInvitesResponseDto } from '../dto/pending-invite.dto';
import { ValidateInviteResponseDto } from '../dto/validate-invite.dto';

// --- TAG GROUP ---
export const ApiInvitationsTags = () => applyDecorators(ApiTags('Invitations'));

// --- SEND INVITE ---
export const ApiSendInvite = () =>
  applyDecorators(
    ApiOperation({ summary: 'Invite new teachers or admins' }),
    ApiBody({ type: InviteUserDto }),
    ApiResponse({
      status: 201,
      description: 'Invitation sent successfully',
      type: PendingInvitesResponseDto, // <-- FIXED
    }),
    ApiResponse({
      status: 409,
      description: 'Invitation already sent',
    }),
  );

// --- VALIDATE INVITE TOKEN ---
export const ApiValidateInvite = () =>
  applyDecorators(
    ApiOperation({ summary: 'Validate invite token' }),
    ApiQuery({
      name: 'token',
      required: true,
      description: 'Invitation token',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Valid token details',
      type: ValidateInviteResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Invitation token not found or invalid',
    }),
  );

// --- GET PENDING INVITES ---
export const ApiGetPendingInvites = () =>
  applyDecorators(
    ApiOperation({ summary: 'Retrieve all pending invites' }),
    ApiResponse({
      status: 200,
      description: 'Returns pending invites',
      type: PendingInvitesResponseDto,
      isArray: true,
    }),
    ApiResponse({
      status: 404,
      description: 'No pending invites found',
    }),
  );
