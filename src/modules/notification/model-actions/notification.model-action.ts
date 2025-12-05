import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';
import {
  NotificationMetadata,
  NotificationType,
} from '../types/notification.types';

@Injectable()
export class NotificationModelAction extends AbstractModelAction<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository, Notification);
  }

  async createBulk(
    notifications: Array<{
      recipient_id: string;
      title: string;
      message: string;
      type: NotificationType;
      metadata?: NotificationMetadata;
      is_read: boolean;
    }>,
  ): Promise<Notification[]> {
    const entities = notifications.map((data) => this.repository.create(data));
    return this.repository.save(entities);
  }
}
