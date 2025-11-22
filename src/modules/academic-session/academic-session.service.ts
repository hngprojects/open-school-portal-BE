import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource, FindOptionsOrder, EntityManager } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';
import { ClassModelAction } from '../class/model-actions/class.actions';

import { ActivateAcademicSessionDto } from './dto/activate-academic-session.dto';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import {
  AcademicSession,
  SessionStatus,
} from './entities/academic-session.entity';
import { AcademicSessionModelAction } from './model-actions/academic-session-actions';
import { SessionClassModelAction } from './model-actions/session-class-actions';
import { SessionStreamModelAction } from './model-actions/session-stream-actions';

export interface IListSessionsOptions {
  page?: number;
  limit?: number;
  order?: FindOptionsOrder<AcademicSession>;
}

export interface ICreateSessionResponse {
  status_code: HttpStatus;
  message: string;
  data: AcademicSession;
}
@Injectable()
export class AcademicSessionService {
  private readonly logger = new Logger(AcademicSessionService.name);
  constructor(
    private readonly sessionModelAction: AcademicSessionModelAction,
    private readonly sessionClassModelAction: SessionClassModelAction,
    private readonly sessionStreamModelAction: SessionStreamModelAction,
    private readonly classModelAction: ClassModelAction,
    private readonly dataSource: DataSource,
  ) {}
  async create(
    createSessionDto: CreateAcademicSessionDto,
  ): Promise<ICreateSessionResponse> {
    const existingSession = await this.sessionModelAction.get({
      identifierOptions: { name: createSessionDto.name },
    });

    if (existingSession) {
      throw new ConflictException(sysMsg.DUPLICATE_SESSION_NAME);
    }

    // Convert date strings to Date objects for comparison
    const start = new Date(createSessionDto.startDate);
    if (start < new Date()) {
      throw new BadRequestException(sysMsg.START_DATE_IN_PAST);
    }
    const end = new Date(createSessionDto.endDate);
    if (end < new Date()) {
      throw new BadRequestException(sysMsg.END_DATE_IN_PAST);
    }
    // 4. End date must be after start date.
    if (end <= start) {
      throw new BadRequestException(sysMsg.INVALID_DATE_RANGE);
    }
    const newSession = await this.sessionModelAction.create({
      createPayload: {
        name: createSessionDto.name,
        startDate: start,
        endDate: end,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });
    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACADEMIC_SESSION_CREATED,
      data: newSession,
    };
  }

  async activeSessions() {
    const sessions = await this.sessionModelAction.list({
      filterRecordOptions: { status: SessionStatus.ACTIVE },
    });

    if (!sessions.payload.length) return null;

    if (sessions.payload.length > 1)
      throw new InternalServerErrorException(
        sysMsg.MULTIPLE_ACTIVE_ACADEMIC_SESSION,
      );

    return sessions.payload[0];
  }

  async findAll(options: IListSessionsOptions = {}) {
    const normalizedPage = Math.max(1, Math.floor(options.page ?? 1));
    const normalizedLimit = Math.max(1, Math.floor(options.limit ?? 20));

    const { payload, paginationMeta } = await this.sessionModelAction.list({
      order: options.order ?? { startDate: 'ASC' },
      paginationPayload: {
        page: normalizedPage,
        limit: normalizedLimit,
      },
    });

    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACADEMIC_SESSION_LIST_SUCCESS,
      data: payload,
      meta: paginationMeta,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} academicSession`;
  }

  update(id: number) {
    return `This action updates a #${id} academicSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} academicSession`;
  }

  async activateAcademicSession(activateDto: ActivateAcademicSessionDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Validate session exists
      const session_to_activate = await this.sessionModelAction.get({
        identifierOptions: { id: activateDto.session_id },
      });

      if (!session_to_activate) {
        throw new NotFoundException(sysMsg.ACADEMIC_SESSION_NOT_FOUND_ERROR);
      }

      // 2. Check if already active
      if (session_to_activate.status === SessionStatus.ACTIVE) {
        throw new BadRequestException(sysMsg.ACADEMIC_SESSION_ALREADY_ACTIVE);
      }

      // 3. Deactivate currently active session(s) and remove their links
      const active_sessions = await this.sessionModelAction.list({
        filterRecordOptions: { status: SessionStatus.ACTIVE },
      });

      for (const active_session of active_sessions.payload) {
        await this.sessionModelAction.update({
          identifierOptions: { id: active_session.id },
          updatePayload: { status: SessionStatus.INACTIVE },
          transactionOptions: { useTransaction: true, transaction: manager },
        });

        // Remove links from previously active session
        await this.removePreviousSessionLinks(active_session.id, manager);
      }

      // 4. Activate new session
      await this.sessionModelAction.update({
        identifierOptions: { id: activateDto.session_id },
        updatePayload: { status: SessionStatus.ACTIVE },
        transactionOptions: { useTransaction: true, transaction: manager },
      });

      // 5. Fetch all classes
      const all_classes = await this.classModelAction.list({});

      let classes_linked = 0;
      let streams_linked = 0;
      const unique_streams = new Set<string>();

      // 6. Link classes to session
      for (const class_entity of all_classes.payload) {
        try {
          await this.sessionClassModelAction.create({
            createPayload: {
              session_id: activateDto.session_id,
              class_id: class_entity.id,
            },
            transactionOptions: { useTransaction: true, transaction: manager },
          });
          classes_linked++;

          // Track unique streams
          if (class_entity.stream) {
            unique_streams.add(class_entity.stream);
          }
        } catch (error) {
          // Handle duplicate entries (unique constraint violation)
          if (error.code !== '23505') {
            throw error;
          }
        }
      }

      // 7. Link unique streams to session
      for (const stream_name of unique_streams) {
        try {
          await this.sessionStreamModelAction.create({
            createPayload: {
              session_id: activateDto.session_id,
              stream_name,
            },
            transactionOptions: { useTransaction: true, transaction: manager },
          });
          streams_linked++;
        } catch (error) {
          // Handle duplicate entries
          if (error.code !== '23505') {
            throw error;
          }
        }
      }

      // Return success with counts
      return {
        status_code: HttpStatus.OK,
        message: sysMsg.ACADEMIC_SESSION_ACTIVATED_SUCCESS,
        data: {
          classes_linked,
          streams_linked,
        },
      };
    });
  }

  private async removePreviousSessionLinks(
    sessionId: string,
    manager: EntityManager,
  ): Promise<void> {
    // Soft delete session-class links
    const session_classes = await this.sessionClassModelAction.list({
      filterRecordOptions: { session_id: sessionId, deleted_at: null },
    });

    for (const link of session_classes.payload) {
      await this.sessionClassModelAction.update({
        identifierOptions: { id: link.id },
        updatePayload: { deleted_at: new Date() },
        transactionOptions: { useTransaction: true, transaction: manager },
      });
    }

    // Soft delete session-stream links
    const session_streams = await this.sessionStreamModelAction.list({
      filterRecordOptions: { session_id: sessionId, deleted_at: null },
    });

    for (const link of session_streams.payload) {
      await this.sessionStreamModelAction.update({
        identifierOptions: { id: link.id },
        updatePayload: { deleted_at: new Date() },
        transactionOptions: { useTransaction: true, transaction: manager },
      });
    }
  }
}
