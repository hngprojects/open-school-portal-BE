import { ConfigService } from '@nestjs/config';
import { Transport, RmqOptions } from '@nestjs/microservices';

// A reusable factory for connecting to RabbitMQ
export const RabbitMQClientFactory = (queueName: string, dlqName: string) => ({
  transport: Transport.RMQ,
  options: {
    urls: [
      (configService: ConfigService) =>
        configService.get<string>('RABBITMQ_URI'),
    ],
    queue: queueName,
    noAck: false,
    queueOptions: {
      durable: true,
      arguments: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-dead-letter-exchange': '',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-dead-letter-routing-key': dlqName,
      },
    },
  } as RmqOptions,
});
