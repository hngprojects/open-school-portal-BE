import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { TeacherModelAction } from 'src/modules/teacher/model-actions/teacher-actions';

import { IRequestWithUser } from '../../../common/types/request-with-user.interface';
import * as sysMsg from '../../../constants/system.messages';
import {
  CreateTeacherManualCheckinDto,
  TeacherManualCheckinResponseDto,
} from '../dto';
import { TeacherManualCheckinStatusEnum } from '../enums/teacher-manual-checkin.enum';
import { TeacherManualCheckinModelAction } from '../model-actions';

@Injectable()
export class TeacherManualCheckinService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly teacherManualCheckinModelAction: TeacherManualCheckinModelAction,
    private readonly teacherModelAction: TeacherModelAction,
  ) {
    this.logger = baseLogger.child({
      context: TeacherManualCheckinService.name,
    });
  }

  // --- CREATE TEACHER MANUAL CHECKIN ---
  async create(user: IRequestWithUser, dto: CreateTeacherManualCheckinDto) {
    // --- Validate teacher exists ---
    const teacher = await this.teacherModelAction.get({
      identifierOptions: { user_id: user.user.userId },
    });
    if (!teacher) {
      this.logger.error(`Teacher not found for user: ${user.user.userId}`);
      throw new NotFoundException(sysMsg.TEACHER_NOT_FOUND);
    }
    const teacherId = teacher.id;

    // --- Validate teacher is active ---
    if (!teacher.is_active) {
      this.logger.error(`Teacher is not active: ${teacherId}`);
      throw new BadRequestException(sysMsg.TEACHER_IS_NOT_ACTIVE);
    }

    // --- Validate date is not in the future ---
    const checkInDate = new Date(dto.date);
    if (checkInDate > new Date()) {
      this.logger.error(`Check in date is in the the future: ${dto.date}`);
      throw new BadRequestException(sysMsg.CHECK_IN_DATE_IS_IN_THE_FUTURE);
    }

    // --- Validate check in time is within school hours ---
    // todo: get from school settings later
    const schoolStartHour = 7; // 7:00 AM
    const schoolEndHour = 17; // 5:00 PM

    // Parse check_in_time string "HH:MM:SS" to get hour
    const [hours] = dto.check_in_time.split(':').map(Number);

    if (hours < schoolStartHour || hours >= schoolEndHour) {
      this.logger.error(
        `Check in time outside school hours: ${dto.check_in_time}`,
      );
      throw new BadRequestException(
        sysMsg.CHECK_IN_TIME_NOT_WITHIN_SCHOOL_HOURS,
      );
    }

    // --- validate teacher has no automated checkins for the same date ---
    //todo: I'd add this check when the automated checkin is implemented

    //--- validate not already checked in for the same date ---
    const existingCheckin = await this.teacherManualCheckinModelAction.get({
      identifierOptions: {
        teacher_id: teacherId,
        check_in_date: new Date(dto.date),
      },
    });
    if (existingCheckin) {
      this.logger.error(`Already checked in for the same date: ${dto.date}`);
      throw new BadRequestException(
        sysMsg.ALREADY_CHECKED_IN_FOR_THE_SAME_DATE,
      );
    }

    // --- Create teacher manual checkin ---

    const checkInTimestamp = new Date(`${dto.date}T${dto.check_in_time}`);
    const teacherManualCheckin =
      await this.teacherManualCheckinModelAction.create({
        createPayload: {
          teacher_id: teacherId,
          check_in_date: new Date(dto.date),
          check_in_time: checkInTimestamp,
          reason: dto.reason,
          submitted_at: new Date(),
          status: TeacherManualCheckinStatusEnum.PENDING,
        },
        transactionOptions: {
          useTransaction: false,
        },
      });

    return {
      message: sysMsg.TEACHER_MANUAL_CHECKIN_CREATED_SUCCESSFULLY,
      data: plainToInstance(
        TeacherManualCheckinResponseDto,
        teacherManualCheckin,
        {
          excludeExtraneousValues: true,
        },
      ),
    };
  }
}
