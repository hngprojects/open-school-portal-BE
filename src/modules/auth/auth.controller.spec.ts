import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { RoleName } from './entities/role.entity';
import { RolesService } from './roles.service';

describe('AuthController', () => {
  let controller: AuthController;
  let rolesService: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    rolesService = module.get<RolesService>(RolesService);
  });

  describe('getRoles', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should return roles with correct status code', async () => {
      const mockRoles = [
        { id: '1', name: RoleName.ADMIN, permissions: [] },
        { id: '2', name: RoleName.TEACHER, permissions: [] },
      ];
      jest.spyOn(rolesService, 'findAll').mockResolvedValue(mockRoles);

      const result = await controller.getRoles();

      expect(result).toEqual({
        status: HttpStatus.OK,
        message: expect.any(String),
        data: mockRoles,
      });
      expect(rolesService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no roles exist', async () => {
      jest.spyOn(rolesService, 'findAll').mockResolvedValue([]);

      const result = await controller.getRoles();

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.data).toEqual([]);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return roles with parsed permissions', async () => {
      const mockRoles = [
        {
          id: '1',
          name: RoleName.ADMIN,
          permissions: ['manage_users', 'view_reports'],
        },
        {
          id: '2',
          name: RoleName.TEACHER,
          permissions: ['view_students', 'submit_grades'],
        },
      ];
      jest.spyOn(rolesService, 'findAll').mockResolvedValue(mockRoles);

      const result = await controller.getRoles();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].permissions).toEqual([
        'manage_users',
        'view_reports',
      ]);
      expect(result.data[1].permissions).toEqual([
        'view_students',
        'submit_grades',
      ]);
    });

    it('should handle errors when fetching roles', async () => {
      jest
        .spyOn(rolesService, 'findAll')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getRoles()).rejects.toThrow('Database error');
    });

    it('should call rolesService.findAll exactly once per request', async () => {
      jest.spyOn(rolesService, 'findAll').mockResolvedValue([]);

      await controller.getRoles();
      await controller.getRoles();
      await controller.getRoles();

      expect(rolesService.findAll).toHaveBeenCalledTimes(3);
    });

    it('should return response with success message', async () => {
      jest.spyOn(rolesService, 'findAll').mockResolvedValue([]);

      const result = await controller.getRoles();

      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe('string');
    });
  });

  describe('getRoleByName', () => {
    it('should return a single role by name', async () => {
      const mockRole = {
        id: '1',
        name: RoleName.ADMIN,
        permissions: ['manage_users', 'view_reports'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.ADMIN);

      expect(result).toEqual({
        status: HttpStatus.OK,
        message: expect.any(String),
        data: mockRole,
      });
      expect(rolesService.findOne).toHaveBeenCalledWith(RoleName.ADMIN);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(null);

      await expect(controller.getRoleByName(RoleName.ADMIN)).rejects.toThrow(
        'not found',
      );
    });

    it('should return TEACHER role with correct permissions', async () => {
      const mockRole = {
        id: '2',
        name: RoleName.TEACHER,
        permissions: ['view_students', 'submit_grades'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.TEACHER);

      expect(result.data.name).toBe(RoleName.TEACHER);
      expect(result.data.permissions).toEqual([
        'view_students',
        'submit_grades',
      ]);
    });

    it('should return STUDENT role', async () => {
      const mockRole = {
        id: '3',
        name: RoleName.STUDENT,
        permissions: ['view_results'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.STUDENT);

      expect(result.data.name).toBe(RoleName.STUDENT);
      expect(result.data.permissions).toEqual(['view_results']);
    });

    it('should return PARENT role', async () => {
      const mockRole = {
        id: '4',
        name: RoleName.PARENT,
        permissions: ['view_child_results', 'view_attendance'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.PARENT);

      expect(result.data.name).toBe(RoleName.PARENT);
      expect(result.data.permissions).toEqual([
        'view_child_results',
        'view_attendance',
      ]);
    });

    it('should return SUPER_ADMIN role', async () => {
      const mockRole = {
        id: '5',
        name: RoleName.SUPER_ADMIN,
        permissions: [
          'approve_content',
          'remove_users',
          'view_reports',
          'manage_roles',
        ],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.SUPER_ADMIN);

      expect(result.data.name).toBe(RoleName.SUPER_ADMIN);
      expect(result.data.permissions).toEqual([
        'approve_content',
        'remove_users',
        'view_reports',
        'manage_roles',
      ]);
    });

    it('should return role with empty permissions array', async () => {
      const mockRole = {
        id: '6',
        name: RoleName.STUDENT,
        permissions: [],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.STUDENT);

      expect(result.data.permissions).toEqual([]);
    });

    it('should call rolesService.findOne with correct parameter', async () => {
      const mockRole = {
        id: '1',
        name: RoleName.ADMIN,
        permissions: ['manage_users'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      await controller.getRoleByName(RoleName.ADMIN);

      expect(rolesService.findOne).toHaveBeenCalledWith(RoleName.ADMIN);
      expect(rolesService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(rolesService, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getRoleByName(RoleName.ADMIN)).rejects.toThrow(
        'Database error',
      );
    });

    it('should return success message', async () => {
      const mockRole = {
        id: '1',
        name: RoleName.ADMIN,
        permissions: ['manage_users'],
      };
      jest.spyOn(rolesService, 'findOne').mockResolvedValue(mockRole);

      const result = await controller.getRoleByName(RoleName.ADMIN);

      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe('string');
    });
  });
});
