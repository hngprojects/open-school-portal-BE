import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async updateRole(roleId: string, updateData: UpdateRoleDto): Promise<Role> {
    // Find role by ID
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    // Check if role exists
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // rotect system roles from modification
    if (role.is_system_role === true) {
      throw new BadRequestException(
        'Cannot modify system roles (admin, teacher, student, parent)',
      );
    }

    // Check for duplicate role name (if name is being updated)
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingRole) {
        throw new ConflictException('Role name already exists');
      }
    }

    // Validate permissions format (if permissions are being updated)
    if (updateData.permissions && !Array.isArray(updateData.permissions)) {
      throw new BadRequestException('Permissions must be an array');
    }

    // Update role fields
    Object.assign(role, updateData);

    // Save updated role
    return this.roleRepository.save(role);
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto): Promise<User> {
    //find user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    //check if user exists
    if (!user) {
      throw new NotFoundException();
    }
    //find role
    const role = await this.roleRepository.findOne({
      where: { id: dto.role_id },
    });
    //check if role exists
    if (!role) {
      throw new NotFoundException();
    }
    //Check if user already has that role
    if (user.role_id === dto.role_id) {
      throw new ConflictException();
    }

    //Assign role
    user.role_id = dto.role_id;
    user.role = role;

    return this.userRepository.save(user);
  }
}
