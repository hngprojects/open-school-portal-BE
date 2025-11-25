import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import { DepartmentSwagger } from '../docs/department.swagger';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentService } from '../services/department.service';

@ApiTags('Department')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation(DepartmentSwagger.decorators.create.operation)
  @ApiBody(DepartmentSwagger.decorators.create.body)
  @ApiResponse(DepartmentSwagger.decorators.create.response)
  @ApiResponse(DepartmentSwagger.decorators.create.errorResponses[0])
  @ApiResponse(DepartmentSwagger.decorators.create.errorResponses[1])
  //CREATE department
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(DepartmentSwagger.decorators.findAll.operation)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (defaults to 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (defaults to 20)',
    example: 20,
  })
  @ApiResponse(DepartmentSwagger.decorators.findAll.response)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return this.departmentService.findAll({
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(DepartmentSwagger.decorators.findOne.operation)
  @ApiParam(DepartmentSwagger.decorators.findOne.parameters.id)
  @ApiResponse(DepartmentSwagger.decorators.findOne.response)
  @ApiResponse(DepartmentSwagger.decorators.findOne.errorResponses[0])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(DepartmentSwagger.decorators.update.operation)
  @ApiParam(DepartmentSwagger.decorators.update.parameters.id)
  @ApiBody(DepartmentSwagger.decorators.update.body)
  @ApiResponse(DepartmentSwagger.decorators.update.response)
  @ApiResponse(DepartmentSwagger.decorators.update.errorResponses[0])
  @ApiResponse(DepartmentSwagger.decorators.update.errorResponses[1])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation(DepartmentSwagger.decorators.remove.operation)
  @ApiParam(DepartmentSwagger.decorators.remove.parameters.id)
  @ApiResponse(DepartmentSwagger.decorators.remove.response)
  @ApiResponse(DepartmentSwagger.decorators.remove.errorResponses[0])
  @ApiResponse(DepartmentSwagger.decorators.remove.errorResponses[1])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.remove(id);
  }
}
