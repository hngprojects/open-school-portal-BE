import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';
import { ClassModule } from '../class/class.module';
import { Student } from '../student/entities/student.entity';

import { StreamController } from './controllers/stream.controller';
import { SessionStream } from './entities/session-stream.entity';
import { Stream } from './entities/stream.entity';
import { SessionStreamModelAction } from './model-actions/session-stream.model-action';
import { StreamModelAction } from './model-actions/stream.model-action';
import { StreamService } from './services/stream.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream, Student, SessionStream]),
    ClassModule,
    AcademicSessionModule,
  ],
  controllers: [StreamController],
  providers: [StreamService, StreamModelAction, SessionStreamModelAction],
  exports: [StreamModelAction],
})
export class StreamModule {}
