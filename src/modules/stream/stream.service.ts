import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../constants/system.messages';

import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream } from './entities/stream.entity';

@Injectable()
export class StreamService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
  ) {
    this.logger = logger.child({ context: StreamService.name });
  }

  private sanitizeName(name: string): string {
    return (name || '').trim().replace(/\s+/g, ' ');
  }

  async create(createStreamDto: CreateStreamDto) {
    const sanitizedName = this.sanitizeName(createStreamDto.name);
    if (!sanitizedName) {
      throw new BadRequestException(sysMsg.STREAM_NAME_REQUIRED);
    }

    // TODO: Add this check when the class module is implemented
    // const parentClass = await this.classRepository.findOne({
    //   where: { id: createStreamDto.class_id },
    // });

    // if (!parentClass) {
    //   throw new NotFoundException(sysMsg.CLASS_NOT_FOUND);
    // }

    const existingStream = await this.streamRepository.findOne({
      where: {
        class_id: createStreamDto.class_id,
        name: sanitizedName,
      },
    });

    if (existingStream) {
      throw new ConflictException(sysMsg.STREAM_ALREADY_EXISTS_IN_CLASS);
    }

    const stream = this.streamRepository.create({
      name: sanitizedName,
      class_id: createStreamDto.class_id,
    });

    const savedStream = await this.streamRepository.save(stream);

    this.logger.info(`Stream created successfully: ${savedStream.id}`);

    return {
      status_code: HttpStatus.CREATED,
      message: sysMsg.STREAM_CREATED_SUCCESSFULLY,
      data: savedStream,
    };
  }
}
