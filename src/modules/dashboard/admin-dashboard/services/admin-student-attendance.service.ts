import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { StudentDailyAttendanceModelAction } from '../../../attendance/model-actions/student-daily-attendance.action';
import {
  GetStudentAttendanceListDto,
  StudentAttendanceListItemDto,
} from '../dto/student-attendance-list.dto';

/**
 * Service for managing admin-specific student attendance operations
 */
@Injectable()
export class AdminStudentAttendanceService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly studentDailyAttendanceModelAction: StudentDailyAttendanceModelAction,
  ) {
    this.logger = baseLogger.child({
      context: AdminStudentAttendanceService.name,
    });
  }

  /**
   * Get paginated, filterable, sortable student attendance records
   */
  async getStudentAttendanceList(query: GetStudentAttendanceListDto): Promise<{
    data: StudentAttendanceListItemDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }> {
    const {
      date,
      page = 1,
      limit = 10,
      student_id,
      class_id,
      subject_id,
      teacher_id,
      status,
      search,
    } = query;

    this.logger.info('Fetching student attendance list', {
      date,
      page,
      limit,
      filters: { student_id, class_id, subject_id, teacher_id, status },
    });

    // Build filter options
    const filterOptions: Record<string, unknown> = {
      date: new Date(date),
    };

    if (student_id) {
      filterOptions.student_id = student_id;
    }

    if (class_id) {
      filterOptions.class_id = class_id;
    }

    if (status) {
      filterOptions.status = status;
    }

    // Build search options for student name or registration number
    const searchOptions: Record<string, unknown> = {};
    if (search) {
      searchOptions.student = {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { registration_number: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Handle teacher and subject filters through relations
    if (teacher_id) {
      // Filter by marked_by (teacher who marked attendance)
      filterOptions.marked_by = teacher_id;
    }

    if (subject_id) {
      this.logger.warn(
        'Subject filter is not applicable for daily attendance records',
        { subject_id },
      );
    }

    // Fetch attendance records with pagination
    const { payload: attendanceRecords, paginationMeta } =
      await this.studentDailyAttendanceModelAction.list({
        filterRecordOptions: { ...filterOptions, ...searchOptions },
        relations: {
          student: { user: true },
          class: true,
          markedBy: true,
        },
        paginationPayload: {
          page,
          limit,
        },
      });

    // Check if any records found
    if (!attendanceRecords || attendanceRecords.length === 0) {
      this.logger.info('No attendance records found', { date, filters: query });
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          total_pages: 0,
        },
      };
    }

    const data: StudentAttendanceListItemDto[] = attendanceRecords.map(
      (record) => {
        const student = record.student;
        const classInfo = record.class;
        const markedBy = record.markedBy;

        if (!student || !student.user) {
          throw new NotFoundException(
            'Student record not found for attendance',
          );
        }

        if (!classInfo) {
          throw new NotFoundException(
            'Class information not found for attendance record',
          );
        }

        return {
          id: record.id,
          student_id: record.student_id,
          student_first_name: student.user.first_name,
          student_middle_name: student.user.middle_name || undefined,
          student_last_name: student.user.last_name,
          student_registration_number: student.registration_number,
          class_id: record.class_id,
          class_name: classInfo.name,
          status: record.status,
          date:
            record.date instanceof Date
              ? record.date.toISOString().split('T')[0]
              : String(record.date).split('T')[0],
          check_in_time:
            record.check_in_time instanceof Date
              ? record.check_in_time.toISOString()
              : record.check_in_time
                ? String(record.check_in_time)
                : undefined,
          check_out_time:
            record.check_out_time instanceof Date
              ? record.check_out_time.toISOString()
              : record.check_out_time
                ? String(record.check_out_time)
                : undefined,
          notes: record.notes || undefined,
          marked_by_id: record.marked_by,
          marked_by_name: markedBy
            ? `${markedBy.first_name} ${markedBy.last_name}`
            : 'Unknown',
          created_at:
            record.createdAt instanceof Date
              ? record.createdAt.toISOString()
              : String(record.createdAt),
          updated_at:
            record.updatedAt instanceof Date
              ? record.updatedAt.toISOString()
              : String(record.updatedAt),
        };
      },
    );

    this.logger.info('Student attendance list retrieved successfully', {
      total: paginationMeta?.total || 0,
      page,
      limit,
    });

    return {
      data,
      meta: {
        total: paginationMeta?.total || 0,
        page,
        limit,
        total_pages: Math.ceil((paginationMeta?.total || 0) / limit),
      },
    };
  }
}
