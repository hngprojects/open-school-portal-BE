import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSession } from '../entities/academic-session.entity';

import { SessionsStatisticsController } from './session-statistics.controller';
import { SessionsStatisticsService } from './session-statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicSession])],
  controllers: [SessionsStatisticsController],
  providers: [SessionsStatisticsService],
})
export class SessionsStatisticsModule {}
