import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StreamModule } from '../stream/stream.module';

import { ClassesController } from './class.controller';
import { ClassesService } from './class.service';
import { ClassTeacher } from './entities/class-teacher.entity';
import { Class } from './entities/class.entity';
import { ClassesModelAction } from './model-actions/class-action';

@Module({
  imports: [TypeOrmModule.forFeature([Class, ClassTeacher]), StreamModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassesModelAction],
  exports: [ClassesService],
})
export class ClassesModule {}
