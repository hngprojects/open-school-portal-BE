import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { School } from './entities/school.entity';
import { SchoolModelAction } from './model-actions/school-actions';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';

@Module({
  imports: [TypeOrmModule.forFeature([School])],
  controllers: [SchoolController],
  providers: [SchoolService, SchoolModelAction],
  exports: [SchoolService, SchoolModelAction],
})
export class SchoolModule {}
