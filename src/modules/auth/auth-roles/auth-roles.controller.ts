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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UserRole } from '../../shared/enums';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { AuthRolesService } from './auth-roles.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuthRolesController {
  constructor(private authRolesService: AuthRolesService) {}

  @Patch('users/:user_id/role')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token',
  })
  async updateUserRole(
    @Param('user_id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.authRolesService.updateUserRole(userId, dto);
  }
}
