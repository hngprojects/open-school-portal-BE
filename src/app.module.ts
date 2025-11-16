import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth-service/auth.module';
import { UserModule } from './user-service/user.module';
import { AcademicModule } from './academic-service/academic.module';
import { AttendanceModule } from './attendance-service/attendance.module';
import { FeeModule } from './fee-service/fee.module';
import { NotificationModule } from './notification-service/notification.module';
import { AnalyticsModule } from './analytics-service/analytics.module';
import { LoggingInterceptor } from './middleware/logging.interceptor';
import { LoggerModule } from './common/logger.module';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    UserModule,
    AcademicModule,
    AttendanceModule,
    FeeModule,
    NotificationModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggingInterceptor],
})
export class AppModule {}
