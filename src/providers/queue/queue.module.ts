import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RabbitMqSetupService } from './rabbitmq.setup';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitMqSetupService],
  exports: [RabbitMqSetupService],
})
export class QueueModule {}
