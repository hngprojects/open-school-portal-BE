import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role, RoleName } from './entities/role.entity';

export interface IRoleDto {
  id: string;
  name: RoleName;
  permissions: string[];
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findAll(): Promise<IRoleDto[]> {
    const roles = await this.roleRepo.find();

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: JSON.parse(role.permissions || '[]'),
    }));
  }

  async findOne(name: RoleName): Promise<IRoleDto | null> {
    const role = await this.roleRepo.findOne({ where: { name } });
    if (!role) return null;
    return {
      id: role.id,
      name: role.name,
      permissions: JSON.parse(role.permissions || '[]'),
    };
  }
}
