import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ClassModule } from '../class/class.module';

import { AcademicSessionController } from './academic-session.controller';
import { AcademicSessionService } from './academic-session.service';
import { AcademicSession } from './entities/academic-session.entity';
import { SessionClass } from './entities/session-class.entity';
import { AcademicSessionModelAction } from './model-actions/academic-session-actions';
import { SessionClassModelAction } from './model-actions/session-class-actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicSession, SessionClass]),
    AuthModule,
    ClassModule,
  ],
  controllers: [AcademicSessionController],
  providers: [
    AcademicSessionService,
    AcademicSessionModelAction,
    SessionClassModelAction,
  ],
  exports: [AcademicSessionService, AcademicSessionModelAction],
})
export class AcademicSessionModule {}
