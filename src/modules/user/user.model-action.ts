import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractModelAction } from '../../shared/abstract-model-action';

import { User } from './models/user.model';

@Injectable()
export class UserModelAction extends AbstractModelAction<User> {
  constructor(@InjectRepository(User) repository: Repository<User>) {
    super(repository, User);
  }
}
