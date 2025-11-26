import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from './entities/department.entity';
import { DepartmentModelAction } from './model-actions/department.actions';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  controllers: [],
  providers: [DepartmentModelAction],
  exports: [DepartmentModelAction],
})
export class DepartmentModule {}
