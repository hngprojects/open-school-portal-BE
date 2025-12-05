import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
} from '../dto';
import { NotificationPreference } from '../entities/notification-preference.entity';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {}

  async findOneByUserId(
    userId: string,
  ): Promise<NotificationPreference | undefined> {
    return this.notificationPreferenceRepository.findOne({
      where: { user_id: userId },
    });
  }

  async create(
    userId: string,
    createDto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const newPreference = this.notificationPreferenceRepository.create({
      ...createDto,
      user_id: userId,
    });
    return this.notificationPreferenceRepository.save(newPreference);
  }

  async update(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference | undefined> {
    const preference = await this.findOneByUserId(userId);
    if (!preference) {
      return undefined; // Return undefined if preference not found
    }

    Object.assign(preference, updateDto);
    return this.notificationPreferenceRepository.save(preference);
  }
}
