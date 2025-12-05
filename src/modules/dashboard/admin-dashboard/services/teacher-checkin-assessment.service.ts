import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Logger } from 'winston';

import { TeacherManualCheckinStatusEnum } from '../../../attendance/enums/teacher-manual-checkin.enum';
import { TeacherManualCheckinModelAction } from '../../../attendance/model-actions/manual-teacher-checkin.action';
import {
  TeacherCheckinAssessmentDataDto,
  TeacherCheckinRecordDto,
  ReviewCheckinDto,
} from '../dto/teacher-checkin-assessment.dto';

interface IGetCheckinRecordsQuery {
  status?: TeacherManualCheckinStatusEnum;
  teacher_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TeacherCheckinAssessmentService {
  private readonly logger: Logger;
  private readonly schoolStartHour = 7; // 7:00 AM
  private readonly defaultPage = 1;
  private readonly defaultLimit = 20;

  constructor(
    private readonly teacherManualCheckinModelAction: TeacherManualCheckinModelAction,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({
      context: TeacherCheckinAssessmentService.name,
    });
  }

  async getTeacherCheckinRecords(
    query: IGetCheckinRecordsQuery,
  ): Promise<TeacherCheckinAssessmentDataDto> {
    this.logger.info('Fetching teacher check-in records for admin assessment');

    const page = query.page || this.defaultPage;
    const limit = query.limit || this.defaultLimit;

    const filterOptions: Record<string, unknown> = {};

    if (query.status) {
      filterOptions.status = query.status;
    }

    if (query.teacher_id) {
      filterOptions.teacher_id = query.teacher_id;
    }

    // Handle date range filtering
    if (query.start_date && query.end_date) {
      filterOptions.check_in_date = Between(
        new Date(query.start_date),
        new Date(query.end_date),
      );
    } else if (query.start_date) {
      filterOptions.check_in_date = MoreThanOrEqual(new Date(query.start_date));
    } else if (query.end_date) {
      filterOptions.check_in_date = LessThanOrEqual(new Date(query.end_date));
    }

    // Fetch check-in records with teacher details
    const { payload: records, paginationMeta } =
      await this.teacherManualCheckinModelAction.list({
        filterRecordOptions: filterOptions,
        relations: { teacher: { user: true }, reviewer: true },
        paginationPayload: { page, limit },
        order: { submitted_at: 'DESC' },
      });

    const totalCount = paginationMeta?.total || 0;

    const checkinRecords: TeacherCheckinRecordDto[] = records.map((record) => {
      const teacher = record.teacher;
      const teacherFullName = teacher?.user
        ? `${teacher.title || ''} ${teacher.user.first_name} ${teacher.user.last_name}`.trim()
        : 'Unknown Teacher';

      return {
        id: record.id,
        teacher_id: record.teacher_id,
        teacher: {
          id: teacher?.id || record.teacher_id,
          title: teacher?.title || '',
          first_name: teacher?.user?.first_name || '',
          last_name: teacher?.user?.last_name || '',
          full_name: teacherFullName,
        },
        check_in_date: record.check_in_date
          ? new Date(record.check_in_date).toISOString().split('T')[0]
          : '',
        check_in_time: record.check_in_time
          ? new Date(record.check_in_time).toISOString()
          : '',
        submitted_at: record.submitted_at
          ? new Date(record.submitted_at).toISOString()
          : '',
        reason: record.reason,
        status: record.status,
        reviewed_by: record.reviewed_by || null,
        reviewed_at: record.reviewed_at
          ? new Date(record.reviewed_at).toISOString()
          : null,
        review_notes: record.review_notes || null,
      };
    });

    // Calculate summary statistics
    const summary = {
      total_records: totalCount || 0,
      pending_records: records.filter(
        (r) => r.status === TeacherManualCheckinStatusEnum.PENDING,
      ).length,
      approved_records: records.filter(
        (r) => r.status === TeacherManualCheckinStatusEnum.APPROVED,
      ).length,
      rejected_records: records.filter(
        (r) => r.status === TeacherManualCheckinStatusEnum.REJECTED,
      ).length,
      late_checkins: records.filter((r) => this.isLateCheckin(r.check_in_time))
        .length,
      on_time_checkins: records.filter(
        (r) => !this.isLateCheckin(r.check_in_time),
      ).length,
    };

    this.logger.info(
      `Retrieved ${records.length} check-in records with ${summary.pending_records} pending`,
    );

    return {
      checkin_records: checkinRecords,
      summary,
    };
  }

  async reviewCheckin(
    checkinId: string,
    reviewDto: ReviewCheckinDto,
    adminUserId: string,
  ): Promise<TeacherCheckinRecordDto> {
    this.logger.info(`Reviewing check-in record ${checkinId}`);

    // Fetch the check-in record
    const record = await this.teacherManualCheckinModelAction.get({
      identifierOptions: { id: checkinId },
      relations: { teacher: { user: true } },
    });

    if (!record) {
      this.logger.error(`Check-in record not found: ${checkinId}`);
      throw new NotFoundException('Check-in record not found');
    }

    // Validate record hasn't been reviewed already
    if (record.status !== TeacherManualCheckinStatusEnum.PENDING) {
      this.logger.error(
        `Check-in record ${checkinId} has already been reviewed`,
      );
      throw new BadRequestException(
        'Check-in record has already been reviewed',
      );
    }

    // Update the record with review information
    await this.teacherManualCheckinModelAction.update({
      identifierOptions: { id: checkinId },
      updatePayload: {
        status: reviewDto.status as TeacherManualCheckinStatusEnum,
        reviewed_by: adminUserId,
        reviewed_at: new Date(),
        review_notes: reviewDto.review_notes || null,
      },
      transactionOptions: { useTransaction: false },
    });

    // Fetch updated record with relations
    const reviewedRecord = await this.teacherManualCheckinModelAction.get({
      identifierOptions: { id: checkinId },
      relations: { teacher: { user: true }, reviewer: true },
    });

    this.logger.info(
      `Check-in record ${checkinId} reviewed as ${reviewDto.status}`,
    );

    const teacher = reviewedRecord?.teacher;
    const teacherFullName = teacher?.user
      ? `${teacher.title || ''} ${teacher.user.first_name} ${teacher.user.last_name}`.trim()
      : 'Unknown Teacher';

    return {
      id: reviewedRecord!.id,
      teacher_id: reviewedRecord!.teacher_id,
      teacher: {
        id: teacher?.id || reviewedRecord!.teacher_id,
        title: teacher?.title || '',
        first_name: teacher?.user?.first_name || '',
        last_name: teacher?.user?.last_name || '',
        full_name: teacherFullName,
      },
      check_in_date: reviewedRecord!.check_in_date
        ? new Date(reviewedRecord!.check_in_date).toISOString().split('T')[0]
        : '',
      check_in_time: reviewedRecord!.check_in_time
        ? new Date(reviewedRecord!.check_in_time).toISOString()
        : '',
      submitted_at: reviewedRecord!.submitted_at
        ? new Date(reviewedRecord!.submitted_at).toISOString()
        : '',
      reason: reviewedRecord!.reason,
      status: reviewedRecord!.status,
      reviewed_by: reviewedRecord!.reviewed_by || null,
      reviewed_at: reviewedRecord!.reviewed_at
        ? new Date(reviewedRecord!.reviewed_at).toISOString()
        : null,
      review_notes: reviewedRecord!.review_notes || null,
    };
  }

  /**
   * Determine if a check-in is late based on school start time
   */
  private isLateCheckin(checkInTime: Date): boolean {
    if (!checkInTime) return false;

    const checkInDate = new Date(checkInTime);
    const checkInHour = checkInDate.getUTCHours();

    return checkInHour > this.schoolStartHour;
  }
}
