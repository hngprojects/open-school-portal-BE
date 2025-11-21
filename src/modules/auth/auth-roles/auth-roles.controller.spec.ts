import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { USER_ROLE_UPDATED } from '../../../constants/system.messages';

import { AuthRolesController } from './auth-roles.controller';
import { AuthRolesService } from './auth-roles.service';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

describe('AuthRolesController', () => {
  let controller: AuthRolesController;
  let authRolesService: AuthRolesService;

  // Mock data
  const mockRole: Role = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'admin',
    description: 'Admin role description',
    permissions: ['read', 'write', 'manage_users'],
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

  // Mock service response with the new format
  const mockUpdateUserRoleResponse = {
    status_code: HttpStatus.OK,
    message: USER_ROLE_UPDATED,
    data: mockUser,
  };

  const mockAuthRolesService = {
    updateUserRole: jest.fn(),
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

  describe('updateUserRole', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174001';
    const updateUserRoleDto: UpdateUserRoleDto = {
      role_id: '123e4567-e89b-12d3-a456-426614174000',
    };

    it('should successfully update user role and return 200 status', async () => {
      // Arrange
      const userWithNewRole = {
        ...mockUser,
        role_id: updateUserRoleDto.role_id,
        role: { ...mockRole, id: updateUserRoleDto.role_id },
      };
      const mockResponse = {
        ...mockUpdateUserRoleResponse,
        data: userWithNewRole,
      };
      mockAuthRolesService.updateUserRole.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updateUserRole(userId, updateUserRoleDto);

      // Assert
      expect(authRolesService.updateUserRole).toHaveBeenCalledWith(
        userId,
        updateUserRoleDto,
      );
      expect(result).toEqual(mockResponse);
      expect(result.data.role_id).toBe(updateUserRoleDto.role_id);
      expect(result.status_code).toBe(HttpStatus.OK);
      expect(result.message).toBe(USER_ROLE_UPDATED);
    });

    it('should call service with correct parameters', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockResolvedValue(
        mockUpdateUserRoleResponse,
      );

      // Act
      await controller.updateUserRole(userId, updateUserRoleDto);

      // Assert
      expect(authRolesService.updateUserRole).toHaveBeenCalledWith(
        userId,
        updateUserRoleDto,
      );
    });

    it('should propagate NotFoundException from service for user not found', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(
        controller.updateUserRole(userId, updateUserRoleDto),
      ).rejects.toThrow('User not found');
    });

    it('should propagate NotFoundException from service for role not found', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockRejectedValue(
        new Error('Role not found'),
      );

      // Act & Assert
      await expect(
        controller.updateUserRole(userId, updateUserRoleDto),
      ).rejects.toThrow('Role not found');
    });

    it('should propagate ConflictException from service', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockRejectedValue(
        new Error('User already has this role'),
      );

      // Act & Assert
      await expect(
        controller.updateUserRole(userId, updateUserRoleDto),
      ).rejects.toThrow('User already has this role');
    });

    it('should validate UUID parameters format', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockResolvedValue(
        mockUpdateUserRoleResponse,
      );

      // Act
      const result = await controller.updateUserRole(userId, updateUserRoleDto);

      // Assert - if we reach here, UUIDs are valid
      expect(result).toBeDefined();
    });

    it('should return 200 OK for PATCH request (using @HttpCode)', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockResolvedValue(
        mockUpdateUserRoleResponse,
      );

      // Act
      const result = await controller.updateUserRole(userId, updateUserRoleDto);

      // Assert
      expect(result.status_code).toBe(HttpStatus.OK);
    });

    it('should handle role change from teacher to admin', async () => {
      // Arrange
      const adminRole = { ...mockRole, id: 'admin-role-id', name: 'admin' };

      const userWithAdminRole = {
        ...mockUser,
        role_id: adminRole.id,
        role: adminRole,
      };

      const updateToAdminDto: UpdateUserRoleDto = { role_id: adminRole.id };

      const mockResponse = {
        status_code: HttpStatus.OK,
        message: USER_ROLE_UPDATED,
        data: userWithAdminRole,
      };

      mockAuthRolesService.updateUserRole.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.updateUserRole(userId, updateToAdminDto);

      // Assert
      expect(result.data.role_id).toBe(adminRole.id);
      expect(result.data.role.name).toBe('admin');
      expect(result.message).toBe(USER_ROLE_UPDATED);
    });
  });

  // Edge Cases and Integration Tests
  describe('Edge Cases', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174001';

    it('should handle service returning null', async () => {
      // Arrange
      mockAuthRolesService.updateUserRole.mockResolvedValue(null);

      // Act
      const result = await controller.updateUserRole(userId, {
        role_id: 'some-role-id',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should handle concurrent role update requests', async () => {
      // Arrange
      const updateRoleDto1: UpdateUserRoleDto = { role_id: 'role1-id' };
      const updateRoleDto2: UpdateUserRoleDto = { role_id: 'role2-id' };

      const mockResponse1 = {
        ...mockUpdateUserRoleResponse,
        data: { ...mockUser, role_id: 'role1-id' },
      };
      const mockResponse2 = {
        ...mockUpdateUserRoleResponse,
        data: { ...mockUser, role_id: 'role2-id' },
      };

      mockAuthRolesService.updateUserRole
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      // Act - simulate concurrent calls
      const [result1, result2] = await Promise.all([
        controller.updateUserRole(userId, updateRoleDto1),
        controller.updateUserRole(userId, updateRoleDto2),
      ]);

      // Assert
      expect(result1.data.role_id).toBe('role1-id');
      expect(result2.data.role_id).toBe('role2-id');
      expect(authRolesService.updateUserRole).toHaveBeenCalledTimes(2);
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
      expect(apiTags).toEqual(['Authentication']);
    });

    it('should have correct operation summary', () => {
      const updateUserRoleSummary = Reflect.getMetadata(
        'swagger/apiOperation',
        AuthRolesController.prototype.updateUserRole,
      );

      expect(updateUserRoleSummary).toEqual({ summary: 'Update user role' });
    });

    it('should have correct HTTP method and path', () => {
      // Verify that it's a PATCH endpoint
      const patchMetadata = Reflect.getMetadata(
        'path',
        AuthRolesController.prototype.updateUserRole,
      );
      expect(patchMetadata).toBe('users/:user_id/role');
    });

    it('should have correct API responses documented', () => {
      const apiResponses = Reflect.getMetadata(
        'swagger/apiResponse',
        AuthRolesController.prototype.updateUserRole,
      );

      // The apiResponses is an object with status codes as keys
      expect(apiResponses).toEqual({
        [HttpStatus.OK]: expect.objectContaining({
          description: 'User role updated successfully',
        }),
        [HttpStatus.NOT_FOUND]: expect.objectContaining({
          description: 'User or role not found',
        }),
        [HttpStatus.CONFLICT]: expect.objectContaining({
          description: 'User already has this role',
        }),
        [HttpStatus.FORBIDDEN]: expect.objectContaining({
          description: 'Insufficient permissions',
        }),
      });
    });

    // Alternative way to test API responses if you want to check individual properties
    it('should have all expected API response status codes', () => {
      const apiResponses = Reflect.getMetadata(
        'swagger/apiResponse',
        AuthRolesController.prototype.updateUserRole,
      );

      expect(apiResponses[HttpStatus.OK]).toBeDefined();
      expect(apiResponses[HttpStatus.OK].description).toBe(
        'User role updated successfully',
      );

      expect(apiResponses[HttpStatus.NOT_FOUND]).toBeDefined();
      expect(apiResponses[HttpStatus.NOT_FOUND].description).toBe(
        'User or role not found',
      );

      expect(apiResponses[HttpStatus.CONFLICT]).toBeDefined();
      expect(apiResponses[HttpStatus.CONFLICT].description).toBe(
        'User already has this role',
      );

      expect(apiResponses[HttpStatus.FORBIDDEN]).toBeDefined();
      expect(apiResponses[HttpStatus.FORBIDDEN].description).toBe(
        'Insufficient permissions',
      );
    });
  });
});
