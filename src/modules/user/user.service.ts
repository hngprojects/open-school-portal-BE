import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IUser } from './entities/user.entity'; // Even if the file is empty, the type is needed

// In-memory array of users for demonstration purposes
const users: IUser[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123', // This will be hashed in the constructor
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

@Injectable()
export class UserService {
  private readonly logger: Logger;
 
    constructor(
      @Inject(WINSTON_MODULE_PROVIDER) private readonly baseLogger: Logger,
      
    ) {
      // Attach service context to logs
      this.logger = this.baseLogger.child({ context: UserService.name });
    // Hash initial passwords for demonstration
      bcrypt.hash('password123', 10).then((hash) => {
      const user = users.find((u) => u.id === '1');
      if (user) {
        user.password = hash;
      }
    });
    }

  async findByEmail(email: string): Promise<IUser> {
    return users.find((user) => user.email === email);
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = users.find((user) => user.id === id);
    if (user) {
      user.password = password; // This will be a hashed password from auth.service
    }
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
}
