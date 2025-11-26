import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../shared/enums';
import {
  ApiDepartmentTags,
  ApiDepartmentBearerAuth,
  ApiCreateDepartment,
  ApiFindOneDepartment,
  ApiFindAllDepartments,
  ApiUpdateDepartment,
  ApiRemoveDepartment,
} from '../docs/department.swagger';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DepartmentService } from '../services/department.service';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiDepartmentTags()
@ApiDepartmentBearerAuth()
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateDepartment()
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiFindOneDepartment()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(id);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiFindAllDepartments()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return this.departmentService.findAll({
      page: Number.isNaN(parsedPage) ? undefined : parsedPage,
      limit: Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiUpdateDepartment()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiRemoveDepartment()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.remove(id);
  }
}
