import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqplib';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { EMAIL_DLQ } from '../../constants/service-constants';
@Injectable()
export class RabbitMqSetupService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: RabbitMqSetupService.name });
  }
  async onModuleInit() {
    await this.setupQueues();
  }

  private async setupQueues() {
    try {
      const uri = this.configService.get<string>('RABBITMQ_URI');

      const connection = await connect(uri);
      const channel = await connection.createChannel();

      // Create Email Dead Letter Queue
      await channel.assertQueue(EMAIL_DLQ, { durable: true });

      this.logger.info(`Infrastructure Ready: ${EMAIL_DLQ} created.`);

      await channel.close();
      await connection.close();
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ infrastructure', {
        error: error.message,
      });
    }
  }
}
