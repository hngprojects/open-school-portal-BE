import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { IRequestWithUser } from 'src/modules/result/utils/grading.util';
import { UserRole } from 'src/modules/shared/enums';

import { ApiCreateTeacherManualCheckinDocs } from '../docs';
import { CreateTeacherManualCheckinDto } from '../dto';
import { TeacherManualCheckinService } from '../services';

@Controller('attendance/teacher/manual-checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Attendance')
@ApiBearerAuth()
export class TeacherManualCheckinController {
  constructor(
    private readonly teacherManualCheckinService: TeacherManualCheckinService,
  ) {}

  @Post()
  @Roles(UserRole.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateTeacherManualCheckinDocs()
  async createTeacherManualCheckin(
    @Req() req: IRequestWithUser,
    @Body() dto: CreateTeacherManualCheckinDto,
  ) {
    return this.teacherManualCheckinService.create(req, dto);
  }
}
