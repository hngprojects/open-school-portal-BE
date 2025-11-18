import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { CustomHttpException } from '../../shared/custom.exception';
import * as SYS_MSG from '../../shared/system-messages';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';

import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginUserRecordOptions: LoginUserDto): Promise<User> {
    const { reg_no, password } = loginUserRecordOptions;
    const user = await this.userService.getUserByRegNo(reg_no);

    if (!user) {
      throw new CustomHttpException(
        SYS_MSG.INVALID_LOGIN_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomHttpException(
        SYS_MSG.INVALID_LOGIN_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, reg_no: user.reg_no };
    return this.jwtService.sign(payload);
  }

  private async prepareAuthResponse(user: User, message: string) {
    const token = this.generateToken(user);
    const { password, ...safeUser } = user;

    return { data: { ...safeUser, accessToken: token } };
  }

  async loginUser(loginUserRecordOptions: LoginUserDto) {
    const user = await this.validateUser(loginUserRecordOptions);

    return this.prepareAuthResponse(user, SYS_MSG.USER_LOGIN_SUCCESSFULLY);
  }
}
