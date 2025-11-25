import { Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { EMAIL_PATTERN } from '../../constants/email-constants';

import { EmailService } from './email.service';
import { EmailPayload } from './email.types';

@Controller()
export class EmailController {
  private readonly logger: Logger;

  constructor(
    private readonly emailService: EmailService,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: EmailController.name });
  }

  @EventPattern(EMAIL_PATTERN)
  async handleSendEmail(
    @Payload() data: EmailPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      // Use structured logging (Winston supports objects as second arg)
      this.logger.info('Processing email job', {
        to: data.to.map((t) => (typeof t === 'string' ? t : t.email)),
        subject: data.subject,
      });

      // 1. Attempt to send
      await this.emailService.sendMail(data);

      channel.ack(originalMsg);
      this.logger.info('Email sent successfully', {
        subject: data.subject,
      });
    } catch (error) {
      this.logger.error('Failed to send email', {
        error: error.message,
        stack: error.stack,
      });

      channel.nack(originalMsg, false, false);
    }
  }
}
