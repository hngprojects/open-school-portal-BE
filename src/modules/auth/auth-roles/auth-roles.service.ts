import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ROLE_NOT_FOUND,
  CANNOT_MODIFY_SYSTEM_ROLES,
  ROLE_ALREADY_EXISTS,
  PERMISSIONS_MUST_BE_ARRAY,
  USER_NOT_FOUND,
  USER_ALREADY_HAS_ROLE,
  ROLE_UPDATED,
  ROLE_ASSIGNED_SUCCESSFULLY,
} from '../../../constants/system.messages';

import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AuthRolesService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async updateRole(roleId: string, updateData: UpdateRoleDto) {
    // Find role by ID
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    // Check if role exists
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }

    // Protect system roles from modification
    if (role.is_system_role === true) {
      throw new BadRequestException(CANNOT_MODIFY_SYSTEM_ROLES);
    }

    // Check for duplicate role name (if name is being updated)
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingRole) {
        throw new ConflictException(ROLE_ALREADY_EXISTS);
      }
    }

    // Validate permissions format (if permissions are being updated)
    if (updateData.permissions && !Array.isArray(updateData.permissions)) {
      throw new BadRequestException(PERMISSIONS_MUST_BE_ARRAY);
    }

    // Update role fields
    Object.assign(role, updateData);

    // Save updated role
    const updatedRole = await this.roleRepository.save(role);

    return {
      status_code: HttpStatus.OK,
      message: ROLE_UPDATED,
      data: updatedRole,
    };
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    // Check if user exists
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    // Find role
    const role = await this.roleRepository.findOne({
      where: { id: dto.role_id },
    });
    // Check if role exists
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }
    // Check if user already has that role
    if (user.role_id === dto.role_id) {
      throw new ConflictException(USER_ALREADY_HAS_ROLE);
    }

    // Assign role
    user.role_id = dto.role_id;
    user.role = role;

    const updatedUser = await this.userRepository.save(user);

    return {
      status_code: HttpStatus.OK,
      message: ROLE_ASSIGNED_SUCCESSFULLY,
      data: updatedUser,
    };
  }
}
