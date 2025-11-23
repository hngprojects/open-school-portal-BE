import {
  ConflictException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { USER_ROLE_UPDATED } from '../../../constants/system.messages';
import { User, UserRole } from '../../user/entities/user.entity';

import { AuthRolesService } from './auth-roles.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';

describe('AuthRolesService', () => {
  let service: AuthRolesService;

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRolesService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthRolesService>(AuthRolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUserRole', () => {
    const userId = 'user-123';
    const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.ADMIN };

    const mockUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      role: [UserRole.TEACHER],
    };

    const mockUpdatedUser = {
      ...mockUser,
      role: [UserRole.ADMIN],
    };

    it('should successfully update user role', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUpdatedUser);

      // Act
      const result = await service.updateUserRole(userId, updateUserRoleDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        role: [UserRole.ADMIN],
      });
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: USER_ROLE_UPDATED,
        data: mockUpdatedUser,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateUserRole(userId, updateUserRoleDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user already has the role', async () => {
      // Arrange
      const userWithSameRole = {
        ...mockUser,
        role: [UserRole.ADMIN],
      };
      mockUserRepository.findOne.mockResolvedValue(userWithSameRole);

      // Act & Assert
      await expect(
        service.updateUserRole(userId, { role: UserRole.ADMIN }),
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle updating to the same role but different case (should still conflict)', async () => {
      // Arrange
      const userWithTeacherRole = {
        ...mockUser,
        role: [UserRole.TEACHER],
      };
      mockUserRepository.findOne.mockResolvedValue(userWithTeacherRole);

      // Act & Assert - Try to update to TEACHER again (same role)
      await expect(
        service.updateUserRole(userId, { role: UserRole.TEACHER }),
      ).rejects.toThrow(ConflictException);
    });

    it('should handle role arrays correctly', async () => {
      // Arrange
      const userWithMultipleRoles = {
        ...mockUser,
        role: [UserRole.TEACHER, UserRole.STUDENT],
      };
      const updatedUser = {
        ...userWithMultipleRoles,
        role: [UserRole.ADMIN],
      };

      mockUserRepository.findOne.mockResolvedValue(userWithMultipleRoles);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserRole(userId, {
        role: UserRole.ADMIN,
      });

      // Assert
      expect(result.data.role).toEqual([UserRole.ADMIN]);
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });
  });
});
