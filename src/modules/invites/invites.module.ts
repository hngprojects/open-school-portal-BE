import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { School } from '../school/entities/school.entity';
import { UserModule } from '../user/user.module';

import { Invite } from './entities/invites.entity';
import { InviteModelAction } from './invite.model-action';
import { InvitesController } from './invites.controller';
import { InviteService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, School]), UserModule],
  controllers: [InvitesController],
  providers: [InviteService, InviteModelAction],
  exports: [InviteService],
})
export class InviteModule {}
