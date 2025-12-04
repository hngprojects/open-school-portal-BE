import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';
import { TermModule } from '../academic-term/term.module';
import { TeachersModule } from '../teacher/teacher.module';

import {
  ScheduleBasedAttendanceController,
  StudentDailyAttendanceController,
  TeacherManualCheckinController,
} from './controllers';
import {
  ScheduleBasedAttendance,
  StudentDailyAttendance,
  TeacherManualCheckin,
} from './entities';
import {
  AttendanceModelAction,
  StudentDailyAttendanceModelAction,
  TeacherManualCheckinModelAction,
} from './model-actions';
import { AttendanceService, TeacherManualCheckinService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleBasedAttendance,
      StudentDailyAttendance,
      TeacherManualCheckin,
    ]),
    AcademicSessionModule,
    TermModule,
    TeachersModule,
  ],
  controllers: [
    ScheduleBasedAttendanceController,
    StudentDailyAttendanceController,
    TeacherManualCheckinController,
  ],
  providers: [
    AttendanceService,
    TeacherManualCheckinService,
    AttendanceModelAction,
    StudentDailyAttendanceModelAction,
    TeacherManualCheckinModelAction,
  ],
  exports: [
    AttendanceService,
    TeacherManualCheckinService,
    TeacherManualCheckinModelAction,
  ],
})
export class AttendanceModule {}
