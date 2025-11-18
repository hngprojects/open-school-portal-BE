import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { AuthRolesService } from './auth-roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Auth - Role ')
@Controller('auth')
export class AuthRolesController {
  constructor(private authRolesService: AuthRolesService) {}

  @Patch('roles/:role_id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard, PermissionsGuard)
  // @Permissions('manage_roles')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'role_id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Role name already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid permissions format or cannot modify system roles',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateRole(
    @Param('role_id', ParseUUIDPipe) roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.authRolesService.updateRole(roleId, dto);
  }

  @Post('users/:user_id/assign-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'user_id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role assigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already has this role',
  })
  async assignRole(
    @Param('user_id', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.authRolesService.assignRoleToUser(userId, dto);
  }
}
