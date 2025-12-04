import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ControllerController } from './controller/controller.controller';
import { Notification } from './entities/notification.entity';
import { NotificationModelAction } from './model-actions/notification.model-action';
import { ServicesService } from './services/services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [ControllerController],
  providers: [ServicesService],
  exports: [NotificationModelAction],
})
export class NotificationModule {}
