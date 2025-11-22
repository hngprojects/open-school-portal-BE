import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionClass } from '../entities/session-class.entity';

@Injectable()
export class SessionClassModelAction extends AbstractModelAction<SessionClass> {
  constructor(
    @InjectRepository(SessionClass)
    sessionClassRepository: Repository<SessionClass>,
  ) {
    super(sessionClassRepository, SessionClass);
  }
}
