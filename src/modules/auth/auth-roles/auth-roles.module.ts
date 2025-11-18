import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthRolesController } from './auth-roles.controller';
import { AuthRolesService } from './auth-roles.service';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [AuthRolesController],
  providers: [AuthRolesService],
  exports: [AuthRolesService],
})
export class AuthRolesModule {}
