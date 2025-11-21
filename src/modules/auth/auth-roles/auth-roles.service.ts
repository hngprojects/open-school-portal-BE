import {
  ConflictException,
  Injectable,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ROLE_NOT_FOUND,
  USER_NOT_FOUND,
  USER_ALREADY_HAS_ROLE,
  USER_ROLE_UPDATED,
} from '../../../constants/system.messages';

import { UpdateUserRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Injectable()
export class AuthRolesService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async updateUserRole(userId: string, dto: UpdateUserRoleDto) {
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

    // Update user's role
    user.role_id = dto.role_id;
    user.role = role;

    const updatedUser = await this.userRepository.save(user);

    return {
      status_code: HttpStatus.OK,
      message: USER_ROLE_UPDATED,
      data: updatedUser,
    };
  }
}
