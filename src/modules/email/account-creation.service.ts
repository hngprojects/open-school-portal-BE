import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { EmailTemplateID } from '../../constants/email-constants';
import { UserRole } from '../shared/enums';

// import * as sysMsg from '../../../constants/system.messages';
import { EmailService } from './email.service';
import { EmailPayload } from './email.types';

@Injectable()
export class AccountCreationService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.logger = baseLogger.child({ context: AccountCreationService.name });
  }

  async sendAccountCreationEmail(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    const website_url = this.configService.get<string>('frontend.url');
    const change_password = `${website_url}/change-password`;
    const school_name =
      this.configService.get<string>('app.name') || 'School Base';
    const logo_url =
      this.configService.get<string>('app.logo_url') ||
      'https://via.placeholder.com/100';

    const emailPayload: EmailPayload = {
      to: [{ email, name }],
      subject: `Your account as been created in ${school_name}`,
      templateNameID: EmailTemplateID.ACCOUNT_CREATED,
      templateData: {
        name,
        school_name,
        logo_url,
        role,
        email,
        password,
        change_password,
      },
    };

    await this.emailService.sendMail(emailPayload);
    this.logger.info('Account Creation email sent', {
      email,
    });
  }
}
