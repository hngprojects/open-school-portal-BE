import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Stream } from '../entities/stream.entity';

@Injectable()
export class StreamModelAction extends AbstractModelAction<Stream> {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
  ) {
    super(streamRepository, Stream);
  }
}
