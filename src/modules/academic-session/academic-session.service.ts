import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { FindOptionsOrder, DataSource } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../constants/system.messages';

import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { UpdateAcademicSessionDto } from './dto/update-academic-session.dto';
import {
  AcademicSession,
  SessionStatus,
} from './entities/academic-session.entity';
import { AcademicSessionModelAction } from './model-actions/academic-session-actions';

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
  private readonly logger: Logger;
  constructor(
    private readonly sessionModelAction: AcademicSessionModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: AcademicSessionService.name });
  }

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

  async activateSession(sessionId: string) {
    const session = await this.sessionModelAction.get({
      identifierOptions: { id: sessionId },
    });

    if (!session) {
      throw new BadRequestException(sysMsg.SESSION_NOT_FOUND);
    }

    const updatedAcademicSession = await this.dataSource.transaction(
      async (manager) => {
        await this.sessionModelAction.update({
          updatePayload: { status: SessionStatus.INACTIVE },
          identifierOptions: {},
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });

        const updateResult = await this.sessionModelAction.update({
          identifierOptions: { id: sessionId },
          updatePayload: { status: SessionStatus.ACTIVE },
          transactionOptions: {
            useTransaction: true,
            transaction: manager,
          },
        });
        if (!updateResult) {
          throw new BadRequestException(
            `Failed to activate session ${sessionId}. Session may have been deleted.`,
          );
        }

        const updated = await this.sessionModelAction.get({
          identifierOptions: { id: sessionId },
        });

        return updated;
      },
    );
    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACADEMY_SESSION_ACTIVATED,
      data: updatedAcademicSession,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} academicSession`;
  }

  async update(
    sessionId: string,
    updateAcademicSessionDto: UpdateAcademicSessionDto,
  ) {
    //check if session exists
    const session = await this.sessionModelAction.get({
      identifierOptions: { id: sessionId },
    });
    if (!session) {
      this.logger.warn(sysMsg.ACADEMIC_SESSION_NOT_FOUND, {
        sessionId: sessionId,
      });
      throw new NotFoundException(sysMsg.ACADEMIC_SESSION_NOT_FOUND);
    }

    //validate start date is before end date
    const start = new Date(updateAcademicSessionDto.start_date);
    if (start < new Date()) {
      this.logger.error(sysMsg.START_DATE_IN_PAST, {
        sessionId: sessionId,
        startDate: updateAcademicSessionDto.start_date,
      });
      throw new BadRequestException(sysMsg.START_DATE_IN_PAST);
    }
    const end = new Date(updateAcademicSessionDto.end_date);
    if (end < new Date()) {
      this.logger.error(sysMsg.END_DATE_IN_PAST, {
        sessionId: sessionId,
        endDate: updateAcademicSessionDto.end_date,
      });
      throw new BadRequestException(sysMsg.END_DATE_IN_PAST);
    }

    //end date cannot be before start date
    if (end <= start) {
      this.logger.error(sysMsg.INVALID_DATE_RANGE, {
        sessionId: sessionId,
        startDate: updateAcademicSessionDto.start_date,
        endDate: updateAcademicSessionDto.end_date,
      });
      throw new BadRequestException(sysMsg.INVALID_DATE_RANGE);
    }

    //validate name is unique
    const existingSession = await this.sessionModelAction.get({
      identifierOptions: { name: updateAcademicSessionDto.name },
    });

    if (existingSession && existingSession.id !== sessionId) {
      this.logger.warn(sysMsg.DUPLICATE_SESSION_NAME, {
        sessionId: sessionId,
        name: updateAcademicSessionDto.name,
      });
      throw new ConflictException(sysMsg.DUPLICATE_SESSION_NAME);
    }

    //update session
    const updatedSession = await this.sessionModelAction.update({
      identifierOptions: { id: sessionId },
      updatePayload: {
        name: updateAcademicSessionDto.name,
        startDate: start,
        endDate: end,
      },
      transactionOptions: {
        useTransaction: false,
      },
    });

    //return updated session
    return {
      status_code: HttpStatus.OK,
      message: sysMsg.ACADEMIC_SESSION_UPDATED,
      data: updatedSession,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} academicSession`;
  }
}
