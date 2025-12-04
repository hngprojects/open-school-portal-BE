import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationModelAction extends AbstractModelAction<Notification> {
  constructor(
    @InjectRepository(Notification)
    notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository, Notification);
  }
}
