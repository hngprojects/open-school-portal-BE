import { Module } from '@nestjs/common';

import { AttendanceModule } from '../../attendance/attendance.module';
import { TimetableModule } from '../../timetable/timetable.module';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminStudentAttendanceService } from './services/admin-student-attendance.service';

@Module({
  imports: [TimetableModule, AttendanceModule],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService, AdminStudentAttendanceService],
  exports: [AdminDashboardService],
})
export class AdminDashboardModule {}
