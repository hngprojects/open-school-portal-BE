import { PaginationMeta } from '@hng-sdk/orm';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { StudentModelAction } from '../../student/model-actions/student-actions';
import { ResultResponseDto, ListResultsQueryDto } from '../dto';
import { Result } from '../entities';
import { ResultModelAction } from '../model-actions';

@Injectable()
export class ResultService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly resultModelAction: ResultModelAction,
    private readonly studentModelAction: StudentModelAction,
  ) {
    this.logger = baseLogger.child({ context: ResultService.name });
  }

  /**
   * Get results for a specific student
   */
  async getStudentResults(
    studentId: string,
    query: ListResultsQueryDto,
  ): Promise<{ data: ResultResponseDto[]; meta: Partial<PaginationMeta> }> {
    // Validate student exists
    const student = await this.studentModelAction.get({
      identifierOptions: { id: studentId },
    });

    if (!student || student.is_deleted) {
      throw new NotFoundException(sysMsg.STUDENT_NOT_FOUND);
    }

    const filterOptions: Record<string, string> = {
      student_id: studentId,
    };

    if (query.term_id) {
      filterOptions.term_id = query.term_id;
    }

    if (query.academic_session_id) {
      filterOptions.academic_session_id = query.academic_session_id;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const results = await this.resultModelAction.list({
      filterRecordOptions: filterOptions,
      relations: {
        student: { user: true },
        class: true,
        term: true,
        academicSession: true,
        subject_lines: { subject: true },
      },
      order: { term: { name: 'ASC' }, createdAt: 'DESC' },
      paginationPayload: { page, limit },
    });

    const transformedResults = results.payload.map((result) =>
      this.transformToResponseDto(result),
    );

    return {
      data: transformedResults,
      meta: results.paginationMeta,
    };
  }

  /**
   * Transform entity to response DTO
   */
  private transformToResponseDto(result: Result): ResultResponseDto {
    const student = result.student;
    const user = student?.user;

    return {
      id: result.id,
      student: {
        id: student?.id || '',
        registration_number: student?.registration_number || '',
        name: user
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : undefined,
      },
      class: {
        id: result.class?.id || '',
        name: result.class?.name || '',
        arm: result.class?.arm,
      },
      term: {
        id: result.term?.id || '',
        name: result.term?.name || '',
      },
      academicSession: {
        id: result.academicSession?.id || '',
        name: result.academicSession?.name || '',
        academicYear: result.academicSession?.academicYear,
      },
      total_score: result.total_score ? Number(result.total_score) : null,
      average_score: result.average_score ? Number(result.average_score) : null,
      grade_letter: result.grade_letter,
      position: result.position,
      remark: result.remark,
      subject_count: result.subject_count,
      subject_lines:
        result.subject_lines?.map((line) => ({
          id: line.id,
          subject: {
            id: line.subject?.id || '',
            name: line.subject?.name || '',
          },
          ca_score: line.ca_score ? Number(line.ca_score) : null,
          exam_score: line.exam_score ? Number(line.exam_score) : null,
          total_score: line.total_score ? Number(line.total_score) : null,
          grade_letter: line.grade_letter,
          remark: line.remark,
        })) || [],
      generated_at: result.generated_at,
      created_at: result.createdAt,
      updated_at: result.updatedAt,
    };
  }
}
