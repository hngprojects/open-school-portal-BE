import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { ModelActionsModule } from '../shared/model-actions.module';

import { AcademicSessionController } from './academic-session.controller';
import { AcademicSessionService } from './academic-session.service';
import { AcademicSession } from './entities/academic-session.entity';
import { SessionClass } from './entities/session-class.entity';
import { SessionClassModelAction } from './model-actions/session-class-actions';

@Module({
  imports: [
    TypeOrmModule.forFeature([AcademicSession, SessionClass]),
    AuthModule,
    ModelActionsModule,
  ],
  controllers: [AcademicSessionController],
  providers: [AcademicSessionService, SessionClassModelAction],
  exports: [AcademicSessionService],
})
export class AcademicSessionModule {}
