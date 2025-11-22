import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Stream } from './entities/stream.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream])],
  controllers: [],
  providers: [],
  exports: [],
})
export class StreamModule {}
