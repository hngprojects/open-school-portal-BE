import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import {
  EMAIL_QUEUE,
  EMAIL_SERVICE_NAME,
  EMAIL_DLQ,
} from '../../constants/service-constants';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: EMAIL_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI')],
            queue:
              configService.get<string>('RABBITMQ_EMAIL_QUEUE') || EMAIL_QUEUE,
            queueOptions: {
              durable: true,
              arguments: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'x-dead-letter-exchange': '',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'x-dead-letter-routing-key': EMAIL_DLQ,
              },
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService, ClientsModule],
})
export class EmailModule {}
