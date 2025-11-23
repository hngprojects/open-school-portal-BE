import {
  ConflictException,
  NotFoundException,
  HttpStatus,
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
    const roleName = UserRole.ADMIN;
    const updateData: UpdateUserRoleDto = { role: roleName };

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserRole(userId, updateData)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw ConflictException when user already has the role', async () => {
      const mockUser = {
        id: userId,
        role: ['ADMIN'], // User already has ADMIN role
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.updateUserRole(userId, updateData)).rejects.toThrow(
        ConflictException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should update user role successfully when valid data is provided', async () => {
      const mockUser = {
        id: userId,
        role: ['TEACHER'], // Current role
        name: 'John Doe',
        email: 'john@example.com',
      };

      const updatedUser = {
        ...mockUser,
        role: ['ADMIN'], // Updated to single role in array
      };

      const expectedResponse = {
        status_code: HttpStatus.OK,
        message: USER_ROLE_UPDATED,
        data: updatedUser,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        role: [roleName], // Should be saved as array with the role name
      });
    });

    it('should update user role and return correct response structure', async () => {
      const mockUser = {
        id: userId,
        role: ['STUDENT'],
        name: 'Jane Smith',
        email: 'jane@example.com',
      };

      const updatedUser = {
        ...mockUser,
        role: ['TEACHER'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, {
        role: UserRole.TEACHER,
      });

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(USER_ROLE_UPDATED);
      expect(result.data).toEqual(updatedUser);
      expect(result.data.role).toEqual(['TEACHER']); // Should be array with the role
    });

    it('should handle case where user has no current role', async () => {
      const mockUser = {
        id: userId,
        role: [], // No current role
        name: 'New User',
        email: 'new@example.com',
      };

      const updatedUser = {
        ...mockUser,
        role: ['STUDENT'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, {
        role: UserRole.STUDENT,
      });

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(USER_ROLE_UPDATED);
      expect(result.data.role).toEqual(['STUDENT']);
    });

    it('should handle role change from PARENT to TEACHER', async () => {
      const mockUser = {
        id: userId,
        role: ['PARENT'],
        name: 'Parent User',
        email: 'parent@example.com',
      };

      const updatedUser = {
        ...mockUser,
        role: ['TEACHER'],
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, {
        role: UserRole.TEACHER,
      });

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(USER_ROLE_UPDATED);
      expect(result.data.role).toEqual(['TEACHER']);
    });

    it('should handle updating to the same role but different case (should still conflict)', async () => {
      const mockUser = {
        id: userId,
        role: ['admin'], // lowercase
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.updateUserRole(userId, { role: UserRole.ADMIN }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
