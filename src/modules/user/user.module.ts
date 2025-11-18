import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModelAction } from './model-actions/user-actions';

@Module({
  controllers: [UserController],
  providers: [UserService, UserModelAction],
  exports: [UserModelAction],
})
export class UserModule {}
