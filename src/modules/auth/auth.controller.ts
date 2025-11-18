import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import {
  role_fetched_successfully,
  role_not_found,
  roles_fetched_successfully,
} from '../../constants/system.messages';

import { RoleName } from './entities/role.entity';
import { RolesService } from './roles.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all roles',
    description:
      'Retrieve all available predefined roles in the system with their permissions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all roles',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Roles fetched successfully',
          description: 'Success message',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                example: '123e4567-e89b-12d3-a456-426614174000',
                description: 'Role ID',
              },
              name: {
                type: 'string',
                enum: Object.values(RoleName),
                example: 'ADMIN',
                description: 'Role name (predefined)',
              },
              permissions: {
                type: 'array',
                items: { type: 'string' },
                example: ['manage_users', 'view_reports'],
                description: 'Array of permissions for this role',
              },
            },
          },
          description: 'List of all roles',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getRoles() {
    const data = await this.rolesService.findAll();
    return {
      status: HttpStatus.OK,
      message: roles_fetched_successfully,
      data,
    };
  }

  @Get('roles/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a specific role by name',
    description: 'Retrieve details of a specific predefined role by its name',
  })
  @ApiParam({
    name: 'name',
    description: 'The role name (must be one of the predefined enum values)',
    enum: Object.values(RoleName),
    example: 'ADMIN',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved the role',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'number',
          example: 200,
          description: 'HTTP status code',
        },
        message: {
          type: 'string',
          example: 'Role with name ADMIN fetched successfully',
          description: 'Success message',
        },
        data: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Role ID',
            },
            name: {
              type: 'string',
              enum: Object.values(RoleName),
              example: 'ADMIN',
              description: 'Role name (predefined)',
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['manage_users', 'view_reports'],
              description: 'Array of permissions for this role',
            },
          },
          description: 'The requested role details',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Role not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 404,
        },
        message: {
          type: 'string',
          example: 'Role with name INVALID_ROLE not found',
        },
        error: {
          type: 'string',
          example: 'Not Found',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        path: {
          type: 'string',
          example: '/auth/roles/INVALID_ROLE',
        },
        method: {
          type: 'string',
          example: 'GET',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getRoleByName(@Param('name') name: RoleName) {
    const role = await this.rolesService.findOne(name);
    if (!role) {
      throw new NotFoundException(role_not_found(name));
    }
    return {
      status: HttpStatus.OK,
      message: role_fetched_successfully(name),
      data: role,
    };
  }
}
