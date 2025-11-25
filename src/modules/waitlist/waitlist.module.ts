import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';

import { WaitlistController } from './controllers/waitlist.controller';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistService } from './services/waitlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Waitlist]), EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
