import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { DataSource, In } from 'typeorm';
import { Logger } from 'winston';

import * as sysMsg from '../../constants/system.messages';
import { Class } from '../class/entities/class.entity';

import { CreateFeesDto } from './dto/fees.dto';
import { Fees } from './entities/fees.entity';
import { FeesModelAction } from './model-action/fees.model-action';

@Injectable()
export class FeesService {
  private readonly logger: Logger;

  constructor(
    private readonly feeModelAction: FeesModelAction,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
  ) {
    this.logger = logger.child({ context: FeesService.name });
  }

  async create(createFeesDto: CreateFeesDto, createdBy: string): Promise<Fees> {
    return this.dataSource.transaction(async (manager) => {
      // Validate that classes exist
      const classes = await manager.find(Class, {
        where: { id: In(createFeesDto.class_ids) },
      });

      if (classes.length !== createFeesDto.class_ids.length) {
        throw new BadRequestException(sysMsg.INVALID_CLASS_IDS);
      }

      // Create fee
      const fee = manager.create(Fees, {
        component_name: createFeesDto.component_name,
        description: createFeesDto.description,
        amount: createFeesDto.amount,
        term: createFeesDto.term,
        created_by: createdBy,
        classes,
      });

      const savedFee = await manager.save(Fees, fee);

      this.logger.info('Fee component created successfully', {
        fee_id: savedFee.id,
        component_name: savedFee.component_name,
        amount: savedFee.amount,
        term: savedFee.term,
        class_count: classes.length,
        created_by: createdBy,
      });

      return savedFee;
    });
  }
}
