import * as crypto from 'crypto';

import {
  Inject,
  Injectable,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { FindOptionsWhere, In } from 'typeorm';
import { Logger } from 'winston';

import { EmailTemplateID } from 'src/constants/email-constants';

import * as sysMsg from '../../constants/system.messages';
import { EmailService } from '../email/email.service';
import { parseCsv } from '../invites/csv-parser';
import { UserRole } from '../user/entities/user.entity';
import { UserModelAction } from '../user/model-actions/user-actions';

import { AcceptInviteDto } from './dto/accept-invite.dto';
import {
  InviteUserDto,
  InviteRole,
  BulkInvitesResponseDto,
} from './dto/invite-user.dto';
import { Invite, InviteStatus } from './entities/invites.entity';
import { InviteModelAction } from './invite.model-action';

@Injectable()
export class InviteService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly configService: ConfigService,
    private readonly userModelAction: UserModelAction,
    private readonly inviteModelAction: InviteModelAction,
    private readonly emailService: EmailService,
  ) {
    this.logger = baseLogger.child({ context: InviteService.name });
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    const { token, password } = acceptInviteDto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const invite = await this.inviteModelAction.get({
      identifierOptions: {
        token_hash: hashedToken,
        status: InviteStatus.PENDING,
      } as FindOptionsWhere<Invite>,
    });

    if (!invite) {
      throw new NotFoundException(sysMsg.INVALID_VERIFICATION_TOKEN);
    }

    if (invite.accepted) {
      throw new ConflictException(sysMsg.EMAIL_ALREADY_EXISTS);
    }

    if (new Date() > invite.expires_at) {
      throw new BadRequestException(sysMsg.TOKEN_EXPIRED);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const names = invite.full_name ? invite.full_name.split(' ') : ['User', ''];
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '';

    const newUser = await this.userModelAction.create({
      createPayload: {
        email: invite.email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: [invite.role as UserRole],
        is_active: true,
        is_verified: true,
      },
      transactionOptions: { useTransaction: false },
    });

    await this.inviteModelAction.update({
      identifierOptions: { id: invite.id },
      updatePayload: { accepted: true },
      transactionOptions: { useTransaction: false },
    });

    this.logger.info(
      `User ${newUser.email} successfully created via invitation.`,
    );

    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.ACCOUNT_CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async uploadCsv(
    file: Express.Multer.File,
    selectedType: InviteRole,
  ): Promise<BulkInvitesResponseDto> {
    if (!file) {
      throw new BadRequestException(sysMsg.NO_BULK_UPLOAD_DATA);
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException(sysMsg.BULK_UPLOAD_NOT_ALLOWED);
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException(sysMsg.INVALID_BULK_UPLOAD_FILE);
    }

    // Parse CSV rows
    const rows = await parseCsv<{ email: string; full_name: string }>(
      file.buffer,
    );

    const filteredRows = rows.filter((row) => row.email?.trim());
    const emails = filteredRows.map((row) => row.email.trim().toLowerCase());

    // Check existing invites
    const existing = await this.inviteModelAction.get({
      identifierOptions: { email: In(emails) } as FindOptionsWhere<Invite>,
    });

    const existingEmails = new Set(
      Array.isArray(existing)
        ? existing.map((invite) => invite.email.toLowerCase())
        : [existing?.email?.toLowerCase()],
    );

    const validRows = filteredRows.filter(
      (row) => !existingEmails.has(row.email.trim().toLowerCase()),
    );

    if (validRows.length === 0) {
      throw new BadRequestException(sysMsg.BULK_UPLOAD_NO_NEW_EMAILS);
    }

    const skippedRows = filteredRows.filter((row) =>
      existingEmails.has(row.email.trim().toLowerCase()),
    );

    const createdInvites: InviteUserDto[] = [];

    // Load values from config.ts
    const frontendUrl = this.configService.get<string>('frontend.url');
    const schoolName = this.configService.get<string>('school.name');
    const schoolLogoUrl = this.configService.get<string>('school.logoUrl');
    const senderEmail = this.configService.get<string>('mail.from.adress');
    const senderName = this.configService.get<string>('mail.from.name');

    if (!frontendUrl || !schoolName || !schoolLogoUrl) {
      throw new InternalServerErrorException(
        'Missing SCHOOL_NAME, SCHOOL_LOGO_URL or FRONTEND_URL in config',
      );
    }

    for (const row of validRows) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

      const invite = await this.inviteModelAction.create({
        createPayload: {
          email: row.email.trim().toLowerCase(),
          full_name: row.full_name?.trim(),
          role: selectedType,
          token_hash: hashedToken,
          status: InviteStatus.PENDING,
          accepted: false,
        },
        transactionOptions: { useTransaction: false },
      });

      await this.inviteModelAction.save({
        entity: invite,
        transactionOptions: { useTransaction: false },
      });

      const inviteLink = `${frontendUrl}/accept-invite?token=${rawToken}`;

      // Split first name safely
      const firstName = invite.full_name?.trim()?.split(' ')?.[0] || 'User';

      // SEND EMAIL using nunjucks template
      await this.emailService.sendMail({
        from: { email: senderEmail, name: senderName },
        to: [{ email: invite.email, name: invite.full_name }],
        subject: `You are invited as ${selectedType}`,
        templateNameID: EmailTemplateID.INVITE,
        templateData: {
          firstName,
          inviteLink,
          role: invite.role,
          schoolName,
          logoUrl: schoolLogoUrl,
          copyRightYear: new Date().getFullYear(),
        },
      });

      createdInvites.push({
        email: invite.email,
        role: selectedType,
        full_name: invite.full_name,
      });
    }

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.BULK_UPLOAD_SUCCESS,
      total_bulk_invites_sent: createdInvites.length,
      data: createdInvites,
      skipped_already_exist_emil_on_csv: skippedRows.map((r) => r.email),
      document_type: selectedType,
    };
  }
}
