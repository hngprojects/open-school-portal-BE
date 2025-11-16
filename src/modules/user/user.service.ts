import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Logger } from 'winston';
import { LOGGER } from 'src/constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class UserService {
  // private readonly logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger = logger.child({
      context: UserService.name,
    });
  }
  create(createUserDto: CreateUserDto) {
    this.logger.info("Logging action")
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
