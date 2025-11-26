import {
  Injectable,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { In } from 'typeorm';

import { EmailTemplateID } from '../../constants/email-constants';
import * as sysMsg from '../../constants/system.messages';
import { EmailService } from '../email/email.service';
import { EmailPayload } from '../email/email.types';
// import { SchoolService } from '../school/school.service';
import { generateUniqueToken } from '../shared/utils/password.util';
import { UserService } from '../user/user.service';

import { InviteUserDto, InviteRole } from './dto/invite-user.dto';
import {
  PendingInviteDto,
  PendingInvitesResponseDto,
} from './dto/pending-invite.dto';
import { InviteStatus } from './entities/invites.entity';
import { InviteModelAction } from './model-actions/invite-action';

@Injectable()
export class InviteService {
  // private readonly logger: Logger;
  constructor(
    private readonly inviteModelAction: InviteModelAction,
    private readonly userService: UserService,
    // private readonly schoolService: SchoolService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}
  async sendInvite(payload: InviteUserDto): Promise<PendingInvitesResponseDto> {
    const frontendUrl = this.configService.get<string>('frontend.url');

    // Check if user exists - using UserService
    const exists = await this.userService.findByEmail(payload.email);
    if (exists) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.ACCOUNT_ALREADY_EXISTS,
        data: [],
      };
    }

    // Check if invitation already sent - using Model Action
    const existingInvite = await this.inviteModelAction.get({
      identifierOptions: {
        email: payload.email,
        status: In([InviteStatus.PENDING, InviteStatus.ACCEPTED]),
      },
    });
    if (existingInvite) {
      return {
        status_code: HttpStatus.CONFLICT,
        message: sysMsg.INVITE_ALREADY_SENT,
        data: [],
      };
    }

    // Get school information - using SchoolService
    // let school;
    // if (payload.school_id) {
    //   school = await this.schoolService.findById(payload.school_id);
    // } else {
    //   school = await this.schoolService.getDefaultSchool();
    // }

    // if (!school) {
    //   return {
    //     status_code: HttpStatus.BAD_REQUEST,
    //     message: 'No school found',
    //     data: [],
    //   };
    // }

    // Generate secure token
    const { rawToken, hashedToken } = await generateUniqueToken();
    const tokenExists = await this.inviteModelAction.get({
      identifierOptions: { token_hash: hashedToken },
    });

    if (tokenExists) {
      throw new ServiceUnavailableException(
        'Could not process invitation at this time. Please try again later',
      );
    }

    // Create invitation record with school reference - using Model Action
    const invite = await this.inviteModelAction.create({
      createPayload: {
        email: payload.email,
        role: payload.role,
        first_name: payload.first_name,
        last_name: payload.last_name,
        token_hash: hashedToken,
        status: InviteStatus.PENDING,
        invited_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
        // school_id: school.id,
      },
      transactionOptions: { useTransaction: false },
    });

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
      subject: `You are invited to join`,
      templateNameID: EmailTemplateID.INVITE,
      templateData: {
        firstName: invite.first_name,
        role: invite.role,
        inviteLink: inviteLink,
        // schoolName: school.name,
        // logoUrl: school.logo_url,
        // schoolEmail: school.email,
      },
    };

    await this.emailService.sendMail(emailPayload);

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.INVITE_SENT,
      data: null,
    };
  }
  // async validateInviteToken(
  //   dto: ValidateInviteDto,
  // ): Promise<ValidateInviteResponseDto> {
  //   const hashToken = createHash('sha256').update(dto.token).digest('hex');
  //   const invite = await this.inviteRepo.findOne({
  //     where: { token_hash: hashToken },
  //   });

  //   // Check if Token exists
  //   if (!invite) {
  //     return {
  //       valid: false,
  //       reason: sysMsg.TOKEN_INVALID,
  //       message: sysMsg.TOKEN_INVALID,
  //     };
  //   }

  //   // Check if it has already been used
  //   if (invite.status === InviteStatus.USED) {
  //     return {
  //       valid: false,
  //       reason: sysMsg.TOKEN_ALREADY_USED,
  //       message: sysMsg.TOKEN_INVALID,
  //     };
  //   }

  //   // Check expiration
  //   const now = new Date();
  //   const expires = new Date(invite.expires_at);

  //   if (now > expires) {
  //     // Update status to expired
  //     await this.inviteRepo.update(invite.id, { status: InviteStatus.EXPIRED });

  //     return {
  //       valid: false,
  //       reason: sysMsg.TOKEN_EXPIRED,
  //       message: sysMsg.TOKEN_EXPIRED,
  //     };
  //   }

  //   return {
  //     valid: true,
  //     reason: sysMsg.VALID_TOKEN,
  //     message: sysMsg.VALID_TOKEN_MESSAGE,
  //     data: {
  //       invite_id: invite.id,
  //       email: invite.email,
  //       role: invite.role,
  //       expires_at: invite.expires_at,
  //       full_name: `${invite.first_name} ${invite.last_name}`,
  //     },
  //   };
  // }

  async getPendingInvites(): Promise<PendingInvitesResponseDto> {
    const invites = await this.inviteModelAction.list({
      filterRecordOptions: { status: InviteStatus.PENDING },
    });

    if (invites.payload.length === 0) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: sysMsg.NO_PENDING_INVITES,
        data: [],
      };
    }

    const mappedInvites: PendingInviteDto[] = invites.payload.map((invite) => ({
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

  async getAcceptedInvites(): Promise<PendingInvitesResponseDto> {
    const invites = await this.inviteModelAction.list({
      filterRecordOptions: { status: InviteStatus.ACCEPTED },
    });

    if (invites.payload.length === 0) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: sysMsg.NO_ACCEPTED_INVITES,
        data: [],
      };
    }

    const mappedInvites: PendingInviteDto[] = invites.payload.map((invite) => ({
      id: invite.id,
      email: invite.email,
      invited_at: invite.invited_at,
      status: invite.status,
    }));

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACCEPTED_INVITES_FETCHED,
      data: mappedInvites,
    };
  }
}
