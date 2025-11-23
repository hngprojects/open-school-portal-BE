import {
  ConflictException,
  Injectable,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  USER_NOT_FOUND,
  USER_ALREADY_HAS_ROLE,
  USER_ROLE_UPDATED,
} from '../../../constants/system.messages';
import { User } from '../../user/entities/user.entity';

import { UpdateUserRoleDto } from './dto/update-role.dto';

@Injectable()
export class AuthRolesService {
  constructor(
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

    // Check if user already has that role
    const hasRole = user.role.some(
      (existingRole) => existingRole.toLowerCase() === dto.role.toLowerCase(),
    );

    if (hasRole) {
      throw new ConflictException(USER_ALREADY_HAS_ROLE);
    }

    // Update user's role
    user.role = [dto.role];

    const updatedUser = await this.userRepository.save(user);

    return {
      status_code: HttpStatus.OK,
      message: USER_ROLE_UPDATED,
      data: updatedUser,
    };
  }
}
