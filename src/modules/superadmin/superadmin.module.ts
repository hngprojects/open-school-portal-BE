import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuperAdmin } from './entities/superadmin.entity';
import { SuperadminModelAction } from './model-actions/superadmin-actions';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';

@Module({
  imports: [TypeOrmModule.forFeature([SuperAdmin])],
  controllers: [SuperadminController],
  providers: [SuperadminService, SuperadminModelAction],
  exports: [SuperadminModelAction],
})
export class SuperadminModule {}
