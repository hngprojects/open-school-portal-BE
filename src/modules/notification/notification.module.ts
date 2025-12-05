import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationController } from './controller/notification.controller';
import { Notification } from './entities/notification.entity';
import { NotificationModelAction } from './model-actions/notification.model-action';
import { NotificationPreferenceModule } from './notification-preference.module';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    NotificationPreferenceModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationModelAction],
  exports: [NotificationModelAction, NotificationService],
})
export class NotificationModule {}
