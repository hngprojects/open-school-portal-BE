import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { User } from '../user/entities/user.entity';

import { Invite } from './entities/invites.entity';
import { InvitesController } from './invites.controller';
import { InviteService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, User]), EmailModule],

  controllers: [InvitesController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
