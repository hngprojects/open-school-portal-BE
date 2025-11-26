import { createHash, randomBytes } from 'crypto';

import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EmailTemplateID } from '../../constants/email-constants';
import * as sysMsg from '../../constants/system.messages';
import { EmailService } from '../email/email.service';
import { EmailPayload } from '../email/email.types';
import { User } from '../user/entities/user.entity';

import {
  InviteUserDto,
  CreatedInviteDto,
  InviteRole,
} from './dto/invite-user.dto';
import {
  PendingInviteDto,
  PendingInvitesResponseDto,
} from './dto/pending-invite.dto';
import {
  ValidateInviteDto,
  ValidateInviteResponseDto,
} from './dto/validate-invite.dto';
import { Invite, InviteStatus } from './entities/invites.entity';

@Injectable()
export class InviteService {
  // private readonly logger: Logger;
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepo: Repository<Invite>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly emailService: EmailService,
  ) {}
  async sendInvite(payload: InviteUserDto): Promise<PendingInvitesResponseDto> {
    const frontendUrl = 'https://staging.borjigin.emerj.net/';

    // Check if user exists
    const exists = await this.userRepo.findOne({
      where: { email: payload.email },
    });

    if (exists) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.ACCOUNT_ALREADY_EXISTS,
        data: [],
      };
    }

    // Check if invitation already sent
    const existingInvite = await this.inviteRepo.findOne({
      where: {
        email: payload.email,
        status: In([InviteStatus.PENDING, InviteStatus.USED]),
      },
    });
    if (existingInvite) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.INVITE_ALREADY_SENT,
        data: [],
      };
    }

    // Generate secure token
    const { rawToken, hashedToken } = await this.generateUniqueToken();

    // Create invitation record with separate first_name and last_name
    const invite = this.inviteRepo.create({
      email: payload.email,
      role: payload.role,
      first_name: payload.first_name,
      last_name: payload.last_name,
      token_hash: hashedToken,
      status: InviteStatus.PENDING,
      invited_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
    });

    await this.inviteRepo.save(invite);

    let route = 'accept-invite';

    switch (payload.role) {
      case InviteRole.TEACHER:
        route = 'invited-teacher';
        break;
      case InviteRole.PARENT:
        route = 'invited-parent';
        break;
      case InviteRole.ADMIN:
        route = 'invited-admin';
        break;
      case InviteRole.STUDENT:
        route = 'invited-student';
        break;
      default:
        route = 'accept-invite';
    }

    // Use the dynamic route in the link
    const inviteLink = `${frontendUrl}/${route}?token=${rawToken}`;

    const emailPayload: EmailPayload = {
      to: [
        {
          email: invite.email,
          name: `${invite.first_name} ${invite.last_name}`,
        },
      ],
      subject: `You are invited to Open School Portal`,
      templateNameID: EmailTemplateID.INVITE,
      templateData: {
        firstName: invite.first_name,
        role: invite.role,
        inviteLink: inviteLink,
        schoolName: 'Open School Portal',
        logoUrl: 'https://your-school-logo-url.com/logo.png',
      },
    };

    // Implement email sending
    try {
      await this.emailService.sendMail(emailPayload);
    } catch {
      // Update invite status to failed if email fails
      await this.inviteRepo.update(invite.id, { status: InviteStatus.FAILED });
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: sysMsg.EMAIL_DELIVERY_FAILED,
        data: [],
      };
    }

    const createdInvite: CreatedInviteDto = {
      id: invite.id,
      email: invite.email,
      invited_at: invite.invited_at,
      role: invite.role as InviteRole,
      first_name: invite.first_name,
      last_name: invite.last_name,
      status: InviteStatus.PENDING,
    };

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.INVITE_SENT,
      data: [createdInvite],
    };
  }
  async validateInviteToken(
    dto: ValidateInviteDto,
  ): Promise<ValidateInviteResponseDto> {
    const hashToken = createHash('sha256').update(dto.token).digest('hex');
    const invite = await this.inviteRepo.findOne({
      where: { token_hash: hashToken },
    });

    // Check if Token exists
    if (!invite) {
      return {
        valid: false,
        reason: sysMsg.INVALID_TOKEN,
        message: sysMsg.INVALID_TOKEN_MESSAGE,
      };
    }

    // Check if it has already been used
    if (invite.status === InviteStatus.USED) {
      return {
        valid: false,
        reason: sysMsg.TOKEN_ALREADY_USED,
        message: sysMsg.TOKEN_ALREADY_USED_MESSAGE,
      };
    }

    // Check expiration
    const now = new Date();
    const expires = new Date(invite.expires_at);

    if (now > expires) {
      // Update status to expired
      await this.inviteRepo.update(invite.id, { status: InviteStatus.EXPIRED });

      return {
        valid: false,
        reason: sysMsg.TOKEN_EXPIRED,
        message: sysMsg.TOKEN_EXPIRED_MESSAGE,
      };
    }

    return {
      valid: true,
      reason: sysMsg.VALID_TOKEN,
      message: sysMsg.VALID_TOKEN_MESSAGE,
      data: {
        invite_id: invite.id,
        email: invite.email,
        role: invite.role,
        expires_at: invite.expires_at,
        full_name: `${invite.first_name} ${invite.last_name}`,
      },
    };
  }

  async getPendingInvites(): Promise<PendingInvitesResponseDto> {
    const invites = await this.inviteRepo.find({
      where: { status: InviteStatus.PENDING },
      order: { invited_at: 'DESC' },
    });

    if (invites.length === 0) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: sysMsg.NO_PENDING_INVITES,
        data: [],
      };
    }

    const mappedInvites: PendingInviteDto[] = invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      invited_at: invite.invited_at,
      status: invite.status,
    }));

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.PENDING_INVITES_FETCHED,
      data: mappedInvites,
    };
  }

  async generateUniqueToken() {
    for (let i = 0; i < 3; i++) {
      const rawToken = randomBytes(32).toString('hex');
      const hashedToken = createHash('sha256').update(rawToken).digest('hex');

      const exists = await this.inviteRepo.findOne({
        where: { token_hash: hashedToken },
      });

      if (!exists) {
        return { rawToken, hashedToken };
      }
    }

    throw new Error('Token generation collision');
  }
}
