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

export interface IActivateSessionResponse {
  status_code: HttpStatus;
  message: string;
  data: {
    session: AcademicSession;
    classes_linked: number;
  };
}

export interface ILinkClassesResponse {
  status_code: HttpStatus;
  message: string;
  data: {
    session_id: string;
    session_name: string;
    classes_linked: number;
  };
}

@Injectable()
export class AcademicSessionService {
  private readonly logger = new Logger(AcademicSessionService.name);
  constructor(
    private readonly sessionModelAction: AcademicSessionModelAction,
    private readonly sessionClassModelAction: SessionClassModelAction,
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
    return `${sysMsg.ACTIVE_ACADEMIC_SESSION_SUCCESS} #${id}`;
  }

  update(id: number) {
    return `${sysMsg.ACADEMIC_SESSION_UPDATED} #${id}`;
  }

  remove(id: number) {
    return `${sysMsg.ACADEMIC_SESSION_REMOVED} #${id}`;
  }

  async activateSession(
    activateDto: ActivateAcademicSessionDto,
  ): Promise<IActivateSessionResponse> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateSessionForActivation(activateDto.session_id);

      await this.deactivateCurrentSessions(manager);

      const activated_session = await this.activateSessionById(
        activateDto.session_id,
        manager,
      );

      const classes_linked = await this.linkClassesToSession(
        activated_session.id,
        manager,
      );

      return {
        status_code: HttpStatus.OK,
        message:
          classes_linked > 0
            ? `${sysMsg.ACADEMIC_SESSION_ACTIVATED} ${classes_linked} ${sysMsg.CLASSES_LINKED}`
            : sysMsg.ACADEMIC_SESSION_ACTIVATED,
        data: {
          session: activated_session,
          classes_linked,
        },
      };
    });
  }

  private async validateSessionForActivation(
    sessionId: string,
  ): Promise<AcademicSession> {
    const session_to_activate = await this.sessionModelAction.get({
      identifierOptions: { id: sessionId },
    });

    if (!session_to_activate) {
      throw new NotFoundException(sysMsg.ACADEMIC_SESSION_NOT_FOUND);
    }

    if (session_to_activate.status === SessionStatus.ACTIVE) {
      throw new BadRequestException(sysMsg.ACADEMIC_SESSION_ALREADY_ACTIVE);
    }

    return session_to_activate;
  }

  private async deactivateCurrentSessions(
    manager: EntityManager,
  ): Promise<void> {
    const active_sessions = await this.sessionModelAction.list({
      filterRecordOptions: { status: SessionStatus.ACTIVE },
    });

    for (const active_session of active_sessions.payload) {
      await this.sessionModelAction.update({
        identifierOptions: { id: active_session.id },
        updatePayload: { status: SessionStatus.INACTIVE },
        transactionOptions: { useTransaction: true, transaction: manager },
      });

      await this.removePreviousSessionLinks(active_session.id, manager);
    }
  }

  private async activateSessionById(
    sessionId: string,
    manager: EntityManager,
  ): Promise<AcademicSession> {
    const activated_session = await this.sessionModelAction.update({
      identifierOptions: { id: sessionId },
      updatePayload: { status: SessionStatus.ACTIVE },
      transactionOptions: { useTransaction: true, transaction: manager },
    });

    return activated_session;
  }

  private async linkClassesToSession(
    sessionId: string,
    manager: EntityManager,
  ): Promise<number> {
    const all_classes = await this.classModelAction.list({});
    let classes_linked = 0;

    for (const class_entity of all_classes.payload) {
      await this.sessionClassModelAction.create({
        createPayload: {
          session_id: sessionId,
          class_id: class_entity.id,
        },
        transactionOptions: { useTransaction: true, transaction: manager },
      });
      classes_linked++;
    }

    return classes_linked;
  }

  async linkClassesToActiveSession(): Promise<ILinkClassesResponse> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Get the active session
      const active_session = await this.activeSessions();

      if (!active_session) {
        throw new NotFoundException(sysMsg.NO_ACTIVE_ACADEMIC_SESSION);
      }

      // 2. Fetch all classes
      const all_classes = await this.classModelAction.list({});

      let classes_linked = 0;

      // 3. Link all classes to active session
      for (const class_entity of all_classes.payload) {
        await this.sessionClassModelAction.create({
          createPayload: {
            session_id: active_session.id,
            class_id: class_entity.id,
          },
          transactionOptions: { useTransaction: true, transaction: manager },
        });
        classes_linked++;
      }

      // Return success with counts
      return {
        status_code: HttpStatus.OK,
        message: 'Classes linked to active session successfully',
        data: {
          session_id: active_session.id,
          session_name: active_session.name,
          classes_linked,
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
  }
}
