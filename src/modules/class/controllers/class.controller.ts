import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { ApiSuccessResponseDto } from '../../../common/dto/response.dto';
import * as sysMsg from '../../../constants/system.messages';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { ClassSwagger } from '../docs/class.swagger';
import { CreateClassDto, ClassResponseDto } from '../dto/create-class.dto';
import { GetTeachersQueryDto } from '../dto/get-teachers-query.dto';
import { TeacherAssignmentResponseDto } from '../dto/teacher-response.dto';
import { ClassService } from '../services/class.service';

@ApiBearerAuth()
@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  @ApiOperation(ClassSwagger.endpoints.createClass.operation)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({ type: CreateClassDto, description: 'Class creation payload' })
  @ApiResponse(ClassSwagger.endpoints.createClass.responses.created)
  @ApiResponse(ClassSwagger.endpoints.createClass.responses.badRequest)
  async createClass(
    @Body() createClassDto: CreateClassDto,
  ): Promise<ApiSuccessResponseDto<ClassResponseDto>> {
    const created = await this.classService.createClass(createClassDto);
    const response: ClassResponseDto = {
      id: created.id,
      name: created.name,
      level: created.level,
    };
    return new ApiSuccessResponseDto(sysMsg.CLASS_CREATED, response);
  }

  @Get(':id/teachers')
  @ApiOperation(ClassSwagger.endpoints.getTeachers.operation)
  @ApiParam(ClassSwagger.endpoints.getTeachers.parameters.id)
  @ApiOkResponse(ClassSwagger.endpoints.getTeachers.responses.ok)
  @ApiNotFoundResponse(ClassSwagger.endpoints.getTeachers.responses.notFound)
  @ApiResponse(ClassSwagger.endpoints.getTeachers.responses.internalServerError)
  async getTeachers(
    @Param('id', ParseUUIDPipe) classId: string,
    @Query() query: GetTeachersQueryDto,
  ): Promise<TeacherAssignmentResponseDto[]> {
    return this.classService.getTeachersByClass(classId, query.session_id);
  }
}
