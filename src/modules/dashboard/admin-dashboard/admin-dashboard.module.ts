import { Module } from '@nestjs/common';

import { AttendanceModule } from '../../attendance/attendance.module';
import { TimetableModule } from '../../timetable/timetable.module';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { TeacherCheckinAssessmentService } from './services/teacher-checkin-assessment.service';

@Module({
  imports: [TimetableModule, AttendanceModule],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, TeacherCheckinAssessmentService],
  exports: [AdminDashboardService, TeacherCheckinAssessmentService],
})
export class AdminDashboardModule {}
