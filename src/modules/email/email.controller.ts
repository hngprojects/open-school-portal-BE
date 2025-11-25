import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { EMAIL_PATTERN } from '../../constants/email-constants';

import { EmailService } from './email.service';
import { EmailPayload } from './email.types';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(EMAIL_PATTERN)
  async handleSendEmail(@Payload() data: EmailPayload) {
    await this.emailService.sendMail(data);
  }
}
