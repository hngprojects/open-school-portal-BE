import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './common/logger.module';
import { LoggingInterceptor } from './middleware/logging.interceptor';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [LoggerModule, UserModule],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor],
})
export class AppModule {}
