import { AbstractModelAction } from '@hng-sdk/orm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fee } from '../entities/fees.entity';

@Injectable()
export class FeeModelAction extends AbstractModelAction<Fee> {
  constructor(
    @InjectRepository(Fee)
    feeRepository: Repository<Fee>,
  ) {
    super(feeRepository, Fee);
  }
}
