import {
  Body,
  Controller,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import { AuthRolesService } from './auth-roles.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthRolesController {
  constructor(private authRolesService: AuthRolesService) {}

  @Patch('users/:user_id/role')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'user_id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already has this role',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateUserRole(
    @Param('user_id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.authRolesService.updateUserRole(userId, dto);
  }
}
