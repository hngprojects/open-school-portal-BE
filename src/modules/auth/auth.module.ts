import { Module } from '@nestjs/common';

import { RedisModule } from '../redis/redis.module'; // Import RedisModule
import { UserModule } from '../user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, RedisModule], // Import RedisModule
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
