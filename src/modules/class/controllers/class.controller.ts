import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { ClassSwagger } from '../docs/class.swagger';
import { CreateClassDto } from '../dto';
import { GetTeachersQueryDto } from '../dto/get-teachers-query.dto';
import { TeacherAssignmentResponseDto } from '../dto/teacher-response.dto';
import { ClassService } from '../services/class.service';

@ApiTags(ClassSwagger.tags[0])
@Controller('classes')
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // --- POST: CREATE CLASS (ADMIN ONLY) ---
  @Post('')
  @ApiOperation(ClassSwagger.endpoints.createClass.operation)
  @ApiResponse(ClassSwagger.endpoints.createClass.responses.created)
  @ApiResponse(ClassSwagger.endpoints.createClass.responses.badRequest)
  @ApiResponse(ClassSwagger.endpoints.createClass.responses.conflict)
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classService.create(createClassDto);
  }

  @Get(':id/teachers')
  @ApiOperation(ClassSwagger.endpoints.getTeachers.operation)
  @ApiParam(ClassSwagger.endpoints.getTeachers.parameters.id)
  @ApiOkResponse(ClassSwagger.endpoints.getTeachers.responses.ok)
  @ApiNotFoundResponse(ClassSwagger.endpoints.getTeachers.responses.notFound)
  async getTeachers(
    @Param('id', ParseUUIDPipe) classId: string,
    @Query() query: GetTeachersQueryDto,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.classService.getTeachersByClass(classId, query.session_id);
  }
}
