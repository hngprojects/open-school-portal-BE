import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Class } from '../class/entities/class.entity';

import { Fees } from './entities/fees.entity';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { FeesModelAction } from './model-action/fees.model-action';

@Module({
  imports: [TypeOrmModule.forFeature([Fees, Class])],
  controllers: [FeesController],
  providers: [FeesService, FeesModelAction],
  exports: [FeesService, FeesModelAction],
})
export class FeesModule {}
