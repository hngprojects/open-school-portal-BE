import {
  Controller,
  Get,
  Patch,
  UseGuards,
  HttpStatus,
  Query,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { IRequestWithUser } from '../../../common/types';
import { TeacherManualCheckinStatusEnum } from '../../attendance/enums/teacher-manual-checkin.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';

import { AdminDashboardService } from './admin-dashboard.service';
import { ApiLoadTodayActivities } from './docs/admin-dashboard.swagger';
import {
  ApiGetTeacherCheckinRecords,
  ApiReviewTeacherCheckin,
} from './docs/teacher-checkin-assessment.swagger';
import { AdminDashboardDataDto } from './dto/admin-dashboard-response.dto';
import {
  ReviewCheckinDto,
  TeacherCheckinAssessmentResponseDto,
  ReviewCheckinResponseDto,
} from './dto/teacher-checkin-assessment.dto';
import { TeacherCheckinAssessmentService } from './services/teacher-checkin-assessment.service';

@Controller('dashboard/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Dashboard')
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly teacherCheckinAssessmentService: TeacherCheckinAssessmentService,
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

  @Get('teacher-checkins')
  @Roles(UserRole.ADMIN)
  @ApiGetTeacherCheckinRecords()
  async getTeacherCheckinRecords(
    @Query('status') status?: TeacherManualCheckinStatusEnum,
    @Query('teacher_id') teacherId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<TeacherCheckinAssessmentResponseDto> {
    const data =
      await this.teacherCheckinAssessmentService.getTeacherCheckinRecords({
        status,
        teacher_id: teacherId,
        start_date: startDate,
        end_date: endDate,
        page,
        limit,
      });

    return {
      message: 'Teacher check-in records retrieved successfully',
      status_code: HttpStatus.OK,
      data,
    };
  }

  @Patch('teacher-checkins/:id/review')
  @Roles(UserRole.ADMIN)
  @ApiReviewTeacherCheckin()
  async reviewTeacherCheckin(
    @Param('id') checkinId: string,
    @Body() reviewDto: ReviewCheckinDto,
    @Req() req: IRequestWithUser,
  ): Promise<ReviewCheckinResponseDto> {
    const adminUserId = req.user.id;

    const data = await this.teacherCheckinAssessmentService.reviewCheckin(
      checkinId,
      reviewDto,
      adminUserId,
    );

    return {
      message: 'Check-in reviewed successfully',
      status_code: HttpStatus.OK,
      data,
    };
  }
}
