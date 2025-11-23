import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../user/entities/user.entity';

import { AuthRolesController } from './auth-roles.controller';
import { AuthRolesService } from './auth-roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthRolesController],
  providers: [AuthRolesService],
  exports: [AuthRolesService],
})
export class AuthRolesModule {}
