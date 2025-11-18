import { Repository } from 'typeorm';

import { Role, RoleName } from './entities/role.entity';
import { RolesService } from './roles.service';

describe('RolesService', () => {
  let service: RolesService;
  let repo: Repository<Role>;

  beforeEach(() => {
    repo = {
      find: jest.fn().mockResolvedValue([
        {
          id: '1',
          name: RoleName.ADMIN,
          permissions: '["manage_users","view_reports"]',
        },
        {
          id: '2',
          name: RoleName.TEACHER,
          permissions: '["view_students","submit_grades"]',
        },
        {
          id: '3',
          name: RoleName.STUDENT,
          permissions: '["view_results"]',
        },
        {
          id: '4',
          name: RoleName.PARENT,
          permissions: '["view_child_results","view_attendance"]',
        },
        {
          id: '5',
          name: RoleName.SUPER_ADMIN,
          permissions:
            '["approve_content","remove_users","view_reports","manage_roles"]',
        },
      ]),
      findOne: jest.fn(),
    } as unknown as Repository<Role>;

    service = new RolesService(repo);
  });

  describe('findAll', () => {
    it('should return all roles with parsed permissions', async () => {
      const roles = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(roles).toEqual([
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
        {
          id: '3',
          name: RoleName.STUDENT,
          permissions: ['view_results'],
        },
        {
          id: '4',
          name: RoleName.PARENT,
          permissions: ['view_child_results', 'view_attendance'],
        },
        {
          id: '5',
          name: RoleName.SUPER_ADMIN,
          permissions: [
            'approve_content',
            'remove_users',
            'view_reports',
            'manage_roles',
          ],
        },
      ]);
    });

    it('should return empty array if no roles exist', async () => {
      (repo.find as jest.Mock).mockResolvedValueOnce([]);
      const roles = await service.findAll();

      expect(repo.find).toHaveBeenCalled();
      expect(roles).toEqual([]);
    });

    it('should handle repository errors gracefully', async () => {
      (repo.find as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
      await expect(service.findAll()).rejects.toThrow('Database error');
      expect(repo.find).toHaveBeenCalled();
    });

    it('should return roles with empty permissions if permissions is null', async () => {
      (repo.find as jest.Mock).mockResolvedValueOnce([
        {
          id: '2',
          name: RoleName.STUDENT,
          permissions: null,
        },
      ]);
      const roles = await service.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(roles).toEqual([
        {
          id: '2',
          name: RoleName.STUDENT,
          permissions: [],
        },
      ]);
    });

    it('should return roles with empty permissions if permissions is an empty string', async () => {
      (repo.find as jest.Mock).mockResolvedValueOnce([
        {
          id: '4',
          name: RoleName.PARENT,
          permissions: '',
        },
      ]);
      const roles = await service.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(roles).toEqual([
        {
          id: '4',
          name: RoleName.PARENT,
          permissions: [],
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a single role by name with parsed permissions', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '1',
        name: RoleName.ADMIN,
        permissions: '["manage_users","view_reports"]',
      });

      const role = await service.findOne(RoleName.ADMIN);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { name: RoleName.ADMIN },
      });
      expect(role).toEqual({
        id: '1',
        name: RoleName.ADMIN,
        permissions: ['manage_users', 'view_reports'],
      });
    });

    it('should return null if role does not exist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);

      const role = await service.findOne(RoleName.ADMIN);

      expect(role).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { name: RoleName.ADMIN },
      });
    });

    it('should find TEACHER role', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '2',
        name: RoleName.TEACHER,
        permissions: '["view_students","submit_grades"]',
      });

      const role = await service.findOne(RoleName.TEACHER);

      expect(role).toEqual({
        id: '2',
        name: RoleName.TEACHER,
        permissions: ['view_students', 'submit_grades'],
      });
    });

    it('should find STUDENT role', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '3',
        name: RoleName.STUDENT,
        permissions: '["view_results"]',
      });

      const role = await service.findOne(RoleName.STUDENT);

      expect(role).toEqual({
        id: '3',
        name: RoleName.STUDENT,
        permissions: ['view_results'],
      });
    });

    it('should find PARENT role', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '4',
        name: RoleName.PARENT,
        permissions: '["view_child_results","view_attendance"]',
      });

      const role = await service.findOne(RoleName.PARENT);

      expect(role).toEqual({
        id: '4',
        name: RoleName.PARENT,
        permissions: ['view_child_results', 'view_attendance'],
      });
    });

    it('should find SUPER_ADMIN role', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '5',
        name: RoleName.SUPER_ADMIN,
        permissions:
          '["approve_content","remove_users","view_reports","manage_roles"]',
      });

      const role = await service.findOne(RoleName.SUPER_ADMIN);

      expect(role).toEqual({
        id: '5',
        name: RoleName.SUPER_ADMIN,
        permissions: [
          'approve_content',
          'remove_users',
          'view_reports',
          'manage_roles',
        ],
      });
    });

    it('should handle null permissions gracefully', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '6',
        name: RoleName.STUDENT,
        permissions: null,
      });

      const role = await service.findOne(RoleName.STUDENT);

      expect(role).toEqual({
        id: '6',
        name: RoleName.STUDENT,
        permissions: [],
      });
    });

    it('should handle empty string permissions', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        id: '7',
        name: RoleName.ADMIN,
        permissions: '',
      });

      const role = await service.findOne(RoleName.ADMIN);

      expect(role).toEqual({
        id: '7',
        name: RoleName.ADMIN,
        permissions: [],
      });
    });

    it('should handle database errors', async () => {
      (repo.findOne as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.findOne(RoleName.ADMIN)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
