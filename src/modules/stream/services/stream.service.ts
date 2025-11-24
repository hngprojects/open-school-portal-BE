import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { FindOptionsWhere } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { AcademicSessionModelAction } from '../../academic-session/model-actions/academic-session-actions';
import { ClassModelAction } from '../../class/model-actions/class.actions';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { StreamResponseDto } from '../dto/stream-response.dto';
import { Stream } from '../entities/stream.entity';
import { SessionStreamModelAction } from '../model-actions/session-stream.model-action';
import { StreamModelAction } from '../model-actions/stream.model-action';

@Injectable()
export class StreamService {
  private readonly logger: Logger;
  constructor(
    private readonly streamModelAction: StreamModelAction,
    private readonly sessionStreamModelAction: SessionStreamModelAction,
    private readonly academicSessionModelAction: AcademicSessionModelAction,
    private readonly classModelAction: ClassModelAction,
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
  ) {
    this.logger = baseLogger.child({ context: StreamService.name });
  }

  async create(createStreamDto: CreateStreamDto) {
    const { name, class_id } = createStreamDto;

    const classExists = await this.classModelAction.get({
      identifierOptions: { id: class_id },
    });

    if (!classExists) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    const existingStream = await this.streamModelAction.get({
      identifierOptions: {
        name,
        class_id,
      } as FindOptionsWhere<Stream>,
    });

    if (existingStream) {
      throw new ConflictException(sysMsg.STREAM_ALREADY_EXISTS_IN_CLASS);
    }

    const newStream = await this.streamModelAction.create({
      createPayload: { name, class_id },
      transactionOptions: { useTransaction: false },
    });

    try {
      const { payload: activeSessions } =
        await this.academicSessionModelAction.list({
          filterRecordOptions: { status: 'Active' } as Record<string, unknown>,
          paginationPayload: { page: 1, limit: 1 },
        });

      const activeSession = activeSessions[0];

      if (activeSession) {
        await this.sessionStreamModelAction.create({
          createPayload: {
            session: activeSession,
            stream: newStream,
          },
          transactionOptions: { useTransaction: false },
        });
      }
    } catch (error) {
      this.logger.warn(
        `Failed to auto-link stream to session: ${error.message}`,
      );
    }

    return {
      id: newStream.id,
      name: newStream.name,
      class_id: newStream.class_id,
      created_at: newStream.createdAt,
      student_count: 0,
    };
  }

  async getStreamsByClass(classId: string): Promise<StreamResponseDto[]> {
    const classExists = await this.classModelAction.get({
      identifierOptions: { id: classId },
    });

    if (!classExists) {
      throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    }

    const { payload: streams } = await this.streamModelAction.list({
      filterRecordOptions: { class_id: classId },

      relations: { students: true },

      paginationPayload: { page: 1, limit: 500 },
      order: { name: 'ASC' },
    });

    // 3. Map to DTO
    return streams.map((stream) => ({
      id: stream.id,
      name: stream.name,
      student_count: stream.students?.length || 0,
    }));
  }
}
