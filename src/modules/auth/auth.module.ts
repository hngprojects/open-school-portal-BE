import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';

import { AuthController } from './auth.controller';
import { Role } from './entities/role.entity';
import { User2fa } from './entities/user-2fa.entity';
import { RolesService } from './roles.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, User2fa, Role])],
  controllers: [TwoFactorAuthController, AuthController],
  providers: [TwoFactorAuthService, RolesService],
  exports: [TwoFactorAuthService, RolesService],
})
export class AuthModule {}
