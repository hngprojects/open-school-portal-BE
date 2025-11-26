import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';

import { Invite } from './entities/invites.entity';
import { InvitesController } from './invites.controller';
import { InviteService } from './invites.service';
import { InviteModelAction } from './model-actions/invite-action';

@Module({
  imports: [TypeOrmModule.forFeature([Invite]), UserModule, EmailModule],
  controllers: [InvitesController],
  providers: [InviteService, InviteModelAction],
  exports: [InviteService],
})
export class InvitesModule {}
