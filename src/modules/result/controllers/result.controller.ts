import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { ListResultsQueryDto, ResultResponseDto } from '../dto';
import { ResultService } from '../services/result.service';

interface IRequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    teacher_id?: string;
    student_id?: string;
    parent_id?: string;
    roles: UserRole[];
  };
}

@ApiTags('Results')
@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get results for a specific student' })
  @ApiResponse({
    status: 200,
    description: 'Student results retrieved successfully',
    type: [ResultResponseDto],
  })
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  async getStudentResults(
    @Req() req: IRequestWithUser,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Query() query: ListResultsQueryDto,
  ) {
    // Authorization check
    if (req.user.roles.includes(UserRole.STUDENT)) {
      if (req.user.student_id !== studentId) {
        throw new ForbiddenException('Unauthorized access to student results');
      }
    } else if (req.user.roles.includes(UserRole.PARENT)) {
      // TODO: Add parent-student relationship check
      // For now, allow if parent role
    }

    return this.resultService.getStudentResults(studentId, query);
  }
}
