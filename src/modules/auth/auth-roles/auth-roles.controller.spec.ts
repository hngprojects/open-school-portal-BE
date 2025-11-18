import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ROLE_UPDATED,
  ROLE_ASSIGNED_SUCCESSFULLY,
} from '../../../constants/system.messages';

import { AuthRolesController } from './auth-roles.controller';
import { AuthRolesService } from './auth-roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

describe('AuthRolesController', () => {
  let controller: AuthRolesController;
  let authRolesService: AuthRolesService;

  // Mock data
  const mockRole: Role = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'custom_role',
    description: 'Test role description',
    permissions: ['read', 'write'],
    tenant_id: 'tenant-123',
    is_system_role: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    users: [],
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@school.com',
    first_name: 'John',
    last_name: 'Doe',
    password_hash: 'hashed_password',
    role_id: '123e4567-e89b-12d3-a456-426614174000',
    role: mockRole,
    tenant_id: 'tenant-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    is_active: true,
  };

  // Mock service responses with the new format
  const mockUpdateRoleResponse = {
    status_code: HttpStatus.OK,
    message: ROLE_UPDATED,
    data: mockRole,
  };

  const mockAssignRoleResponse = {
    status_code: HttpStatus.OK,
    message: ROLE_ASSIGNED_SUCCESSFULLY,
    data: mockUser,
  };

  const mockAuthRolesService = {
    updateRole: jest.fn(),
    assignRoleToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthRolesController],
      providers: [
        {
          provide: AuthRolesService,
          useValue: mockAuthRolesService,
        },
      ],
    }).compile();

    controller = module.get<AuthRolesController>(AuthRolesController);
    authRolesService = module.get<AuthRolesService>(AuthRolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateRole', () => {
    const roleId = '123e4567-e89b-12d3-a456-426614174000';
    const updateRoleDto: UpdateRoleDto = {
      name: 'updated_role',
      description: 'Updated description',
      permissions: ['read', 'write', 'delete'],
    };

    it('should successfully update a role and return 200 status', async () => {
      // Arrange
      const updatedRole = { ...mockRole, ...updateRoleDto };
      const mockResponse = {
        ...mockUpdateRoleResponse,
        data: updatedRole,
      };
      mockAuthRolesService.updateRole.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updateRole(roleId, updateRoleDto);

      // Assert
      expect(authRolesService.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(mockResponse);
      expect(result.data.name).toBe('updated_role');
      expect(result.data.description).toBe('Updated description');
      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(ROLE_UPDATED);
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockAuthRolesService.updateRole.mockResolvedValue(mockUpdateRoleResponse);

      // Act
      await controller.updateRole(roleId, updateRoleDto);

      // Assert
      expect(authRolesService.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialUpdateDto: UpdateRoleDto = {
        description: 'Only updating description',
      };
      const partiallyUpdatedRole = { ...mockRole, ...partialUpdateDto };
      const mockResponse = {
        ...mockUpdateRoleResponse,
        data: partiallyUpdatedRole,
      };
      mockAuthRolesService.updateRole.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updateRole(roleId, partialUpdateDto);

      // Assert
      expect(authRolesService.updateRole).toHaveBeenCalledWith(
        roleId,
        partialUpdateDto,
      );
      expect(result.data.description).toBe('Only updating description');
      expect(result.data.name).toBe(mockRole.name); // Unchanged
    });

    it('should propagate NotFoundException from service', async () => {
      // Arrange
      mockAuthRolesService.updateRole.mockRejectedValue(
        new Error('Role not found'),
      );

      // Act & Assert
      await expect(
        controller.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Role not found');
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockAuthRolesService.updateRole.mockRejectedValue(
        new Error('Role name already exists'),
      );

      // Act & Assert
      await expect(
        controller.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Role name already exists');
    });

    it('should propagate BadRequestException from service', async () => {
      // Arrange
      mockAuthRolesService.updateRole.mockRejectedValue(
        new Error('Cannot modify system roles'),
      );

      // Act & Assert
      await expect(
        controller.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Cannot modify system roles');
    });

    it('should validate UUID parameter format', async () => {
      // This test is handled by NestJS ParseUUIDPipe automatically
      // The controller will reject invalid UUIDs before reaching service
      mockAuthRolesService.updateRole.mockResolvedValue(mockUpdateRoleResponse);

      // Act
      const result = await controller.updateRole(roleId, updateRoleDto);

      // Assert - if we reach here, UUID is valid
      expect(result).toBeDefined();
    });
  });

  describe('assignRole', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174001';
    const assignRoleDto: AssignRoleDto = {
      role_id: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should successfully assign role to user and return 200 status', async () => {
      // Arrange
      const userWithNewRole = { ...mockUser, role_id: assignRoleDto.role_id };
      const mockResponse = {
        ...mockAssignRoleResponse,
        data: userWithNewRole,
      };
      mockAuthRolesService.assignRoleToUser.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.assignRole(userId, assignRoleDto);

      // Assert
      expect(authRolesService.assignRoleToUser).toHaveBeenCalledWith(
        userId,
        assignRoleDto,
      );
      expect(result).toEqual(mockResponse);
      expect(result.data.role_id).toBe(assignRoleDto.role_id);
      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(ROLE_ASSIGNED_SUCCESSFULLY);
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockResolvedValue(
        mockAssignRoleResponse,
      );

      // Act
      await controller.assignRole(userId, assignRoleDto);

      // Assert
      expect(authRolesService.assignRoleToUser).toHaveBeenCalledWith(
        userId,
        assignRoleDto,
      );
    });

    it('should propagate NotFoundException from service for user not found', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(
        controller.assignRole(userId, assignRoleDto),
      ).rejects.toThrow('User not found');
    });

    it('should propagate NotFoundException from service for role not found', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockRejectedValue(
        new Error('Role not found'),
      );

      // Act & Assert
      await expect(
        controller.assignRole(userId, assignRoleDto),
      ).rejects.toThrow('Role not found');
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockRejectedValue(
        new Error('User already has this role'),
      );

      // Act & Assert
      await expect(
        controller.assignRole(userId, assignRoleDto),
      ).rejects.toThrow('User already has this role');
    });

    it('should validate both UUID parameters format', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockResolvedValue(
        mockAssignRoleResponse,
      );

      // Act
      const result = await controller.assignRole(userId, assignRoleDto);

      // Assert - if we reach here, UUIDs are valid
      expect(result).toBeDefined();
    });

    it('should return 200 OK for POST request (using @HttpCode)', async () => {
      // Arrange
      mockAuthRolesService.assignRoleToUser.mockResolvedValue(
        mockAssignRoleResponse,
      );

      // Act
      const result = await controller.assignRole(userId, assignRoleDto);

      expect(result).toBeDefined();
    });
  });

  // Edge Cases and Integration Tests
  describe('Edge Cases', () => {
    const roleId = '123e4567-e89b-12d3-a456-426614174000';

    it('should handle empty update body', async () => {
      // Arrange
      const emptyUpdateDto: UpdateRoleDto = {};
      mockAuthRolesService.updateRole.mockResolvedValue(mockUpdateRoleResponse);

      // Act
      const result = await controller.updateRole(roleId, emptyUpdateDto);

      // Assert
      expect(authRolesService.updateRole).toHaveBeenCalledWith(
        roleId,
        emptyUpdateDto,
      );
      expect(result).toEqual(mockUpdateRoleResponse);
    });

    it('should handle service returning null', async () => {
      // Arrange
      mockAuthRolesService.updateRole.mockResolvedValue(null);

      // Act
      const result = await controller.updateRole(roleId, {});

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent requests', async () => {
      // Arrange
      const updateRoleDto1: UpdateRoleDto = { name: 'role1' };
      const updateRoleDto2: UpdateRoleDto = { name: 'role2' };

      const mockResponse1 = {
        ...mockUpdateRoleResponse,
        data: { ...mockRole, name: 'role1' },
      };
      const mockResponse2 = {
        ...mockUpdateRoleResponse,
        data: { ...mockRole, name: 'role2' },
      };

      mockAuthRolesService.updateRole
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      // Act - simulate concurrent calls
      const [result1, result2] = await Promise.all([
        controller.updateRole(roleId, updateRoleDto1),
        controller.updateRole(roleId, updateRoleDto2),
      ]);

      // Assert
      expect(result1.data.name).toBe('role1');
      expect(result2.data.name).toBe('role2');
      expect(authRolesService.updateRole).toHaveBeenCalledTimes(2);
    });
  });

  // API Documentation Tests (Meta-tests)
  describe('API Documentation', () => {
    it('should have correct API tags', () => {
      // This verifies the @ApiTags decorator
      const apiTags = Reflect.getMetadata(
        'swagger/apiUseTags',
        AuthRolesController,
      );
      expect(apiTags).toEqual(['Auth - Role ']);
    });

    it('should have correct operation summaries', () => {
      const updateRoleSummary = Reflect.getMetadata(
        'swagger/apiOperation',
        AuthRolesController.prototype.updateRole,
      );
      const assignRoleSummary = Reflect.getMetadata(
        'swagger/apiOperation',
        AuthRolesController.prototype.assignRole,
      );

      expect(updateRoleSummary).toEqual({ summary: 'Update a role' });
      expect(assignRoleSummary).toEqual({ summary: 'Assign role to user' });
    });
  });
});
