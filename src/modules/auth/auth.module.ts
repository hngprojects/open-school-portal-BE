import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';

import { User2fa } from './entities/user-2fa.entity';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { Invite } from './entities/invites.entity';
import { PendingInvitesController } from './invites/pending-invites.controller';
import { PendingInvitesService } from './invites/pending-invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, User2fa, Invite])],
  controllers: [TwoFactorAuthController, PendingInvitesController],
  providers: [TwoFactorAuthService, PendingInvitesService],
  exports: [TwoFactorAuthService],
})
export class AuthModule {}
