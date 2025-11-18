import { Injectable } from '@nestjs/common';

import CreateUserRecordOptions from './type/create-user.type';
import { UserModelAction } from './user.model-action';

@Injectable()
export class UserService {
  // private readonly logger: Logger;
  constructor(private userModelAction: UserModelAction) {
    // @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    // this.logger = logger.child({
    //   context: UserService.name,
    // });
  }
  create() {
    // this.logger.info('Logging action');
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async createUser(createPayload: CreateUserRecordOptions) {
    const user = await this.userModelAction.create(createPayload);

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  async getUserByRegNo(
    regNo: string,
    queryOptions?: object,
    relations?: object,
  ) {
    const query = { reg_no: regNo };

    return this.userModelAction.get(query, queryOptions, relations);
  }
}
