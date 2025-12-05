import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class NotificationService {
  private readonly logger: Logger;

  constructor(@Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger) {
    this.logger = baseLogger.child({ context: NotificationService.name });
  }
}
