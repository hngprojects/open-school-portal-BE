import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { School } from '../school/entities/school.entity';
import { User } from '../user/entities/user.entity';

import { Invite } from './entities/invites.entity';
import { InvitesController } from './invites.controller';
import { InviteService } from './invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, User, School]), EmailModule],

  controllers: [InvitesController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
