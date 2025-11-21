import {
  ConflictException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { USER_ROLE_UPDATED } from '../../../constants/system.messages';

import { AuthRolesService } from './auth-roles.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

describe('AuthRolesService', () => {
  let service: AuthRolesService;

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
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
    const roleId = 'role-456';
    const updateData: UpdateUserRoleDto = { role_id: roleId };

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserRole(userId, updateData)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRoleRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when role does not exist', async () => {
      const mockUser = {
        id: userId,
        role_id: 'old-role-id',
        role: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserRole(userId, updateData)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
      });
    });

    it('should throw ConflictException when user already has the role', async () => {
      const mockUser = {
        id: userId,
        role_id: roleId,
        role: null,
      };

      const mockRole = {
        id: roleId,
        name: 'admin',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);

      await expect(service.updateUserRole(userId, updateData)).rejects.toThrow(
        ConflictException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should update user role successfully when valid data is provided', async () => {
      const oldRoleId = 'old-role-789';
      const mockUser = {
        id: userId,
        role_id: oldRoleId,
        role: null,
      };

      const mockRole = {
        id: roleId,
        name: 'admin',
      };

      const updatedUser = {
        ...mockUser,
        role_id: roleId,
        role: mockRole,
      };

      const expectedResponse = {
        status_code: HttpStatus.OK,
        message: USER_ROLE_UPDATED,
        data: updatedUser,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        role_id: roleId,
        role: mockRole,
      });
    });

    it('should update user role and return correct response structure', async () => {
      const mockUser = {
        id: userId,
        role_id: 'old-role-id',
        role: null,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockRole = {
        id: roleId,
        name: 'teacher',
        permissions: ['read', 'write'],
      };

      const updatedUser = {
        ...mockUser,
        role_id: roleId,
        role: mockRole,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole(userId, updateData);

      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(USER_ROLE_UPDATED);
      expect(result.data).toEqual(updatedUser);
      expect(result.data.role_id).toBe(roleId);
      expect(result.data.role).toEqual(mockRole);
    });
  });
});
