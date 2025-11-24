import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionStream } from '../entities/session-stream.entity';

@Injectable()
export class SessionStreamModelAction extends AbstractModelAction<SessionStream> {
  constructor(
    @InjectRepository(SessionStream)
    private readonly sessionStreamRepo: Repository<SessionStream>,
  ) {
    super(sessionStreamRepo, SessionStream);
  }
}
