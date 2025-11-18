import {
  BadRequestException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ROLE_UPDATED } from '../../../constants/system.messages';

import { AuthRolesService } from './auth-roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

describe('AuthRolesService', () => {
  let service: AuthRolesService;

  const mockRoleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
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

  describe('updateRole', () => {
    it('should throw ConflictException when role name already exists', async () => {
      const mockRole = {
        id: 'role-123',
        name: 'test_role',
        is_system_role: false,
        permissions: ['read'],
      };

      const existingRole = {
        id: 'role-456',
        name: 'existing_role_name',
        is_system_role: false,
        permissions: ['write'],
      };

      mockRoleRepository.findOne
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(existingRole);

      const updateData: UpdateRoleDto = { name: 'existing_role_name' };

      await expect(service.updateRole('role-123', updateData)).rejects.toThrow(
        ConflictException,
      );

      expect(mockRoleRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException when trying to modify system role', async () => {
      const systemRole = {
        id: 'admin-role',
        name: 'admin',
        is_system_role: true,
        permissions: ['all'],
      };

      mockRoleRepository.findOne.mockResolvedValue(systemRole);

      const updateData: UpdateRoleDto = { name: 'new_admin_name' };

      await expect(
        service.updateRole('admin-role', updateData),
      ).rejects.toThrow(BadRequestException);

      expect(mockRoleRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update role successfully when name is unique', async () => {
      const mockRole = {
        id: 'role-123',
        name: 'old_name',
        is_system_role: false,
        permissions: ['read'],
      };

      const updatedRole = {
        ...mockRole,
        name: 'new_unique_name',
      };

      const expectedResponse = {
        status_code: HttpStatus.OK,
        message: ROLE_UPDATED,
        data: updatedRole,
      };

      mockRoleRepository.findOne
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(null);

      mockRoleRepository.save.mockResolvedValue(updatedRole);

      const updateData: UpdateRoleDto = { name: 'new_unique_name' };
      const result = await service.updateRole('role-123', updateData);

      expect(result).toEqual(expectedResponse);
      expect(mockRoleRepository.save).toHaveBeenCalledWith(updatedRole);
    });
  });
});
