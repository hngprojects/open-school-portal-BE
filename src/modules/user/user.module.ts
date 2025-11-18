import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './models/user.model';
import { UserController } from './user.controller';
import { UserModelAction } from './user.model-action';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserModelAction],
  exports: [UserService, UserModelAction, TypeOrmModule],
})
export class UserModule {}
