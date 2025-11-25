import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ModelActionsModule } from '../shared/model-actions.module';

import { ClassController } from './controllers/class.controller';
import { ClassTeacher } from './entities/class-teacher.entity';
import { Class } from './entities/class.entity';
import { ClassService } from './services/class.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassTeacher]),
    ModelActionsModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [],
})
export class ClassModule {}
