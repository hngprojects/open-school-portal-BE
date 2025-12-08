import { Controller, Get, UseGuards, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';

import { AdminDashboardService } from './admin-dashboard.service';
import {
  ApiLoadTodayActivities,
  ApiGetStudentAttendanceList,
} from './docs/admin-dashboard.swagger';
import { AdminDashboardDataDto } from './dto/admin-dashboard-response.dto';
import {
  GetStudentAttendanceListDto,
  StudentAttendanceListResponseDto,
} from './dto/student-attendance-list.dto';
import { AdminStudentAttendanceService } from './services/admin-student-attendance.service';

@Controller('dashboard/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Dashboard')
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly adminStudentAttendanceService: AdminStudentAttendanceService,
  ) {}

  @Get('today-activities')
  @Roles(UserRole.ADMIN)
  @ApiLoadTodayActivities()
  async loadTodayActivities(): Promise<{
    message: string;
    status_code: number;
    data: AdminDashboardDataDto;
  }> {
    const data = await this.adminDashboardService.loadTodayActivities();

    return {
      message: "Today's activities loaded successfully",
      status_code: HttpStatus.OK,
      data,
    };
  }

  @Get('student-attendance')
  @Roles(UserRole.ADMIN)
  @ApiGetStudentAttendanceList()
  async getStudentAttendanceList(
    @Query() query: GetStudentAttendanceListDto,
  ): Promise<StudentAttendanceListResponseDto> {
    const { data, meta } =
      await this.adminStudentAttendanceService.getStudentAttendanceList(query);

    return {
      message: 'Student attendance records retrieved successfully',
      status_code: HttpStatus.OK,
      data,
      meta,
    };
  }
}
