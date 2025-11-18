import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { SYS_MSG } from '../../constants/system-messages';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';

import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly baseLogger: Logger,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService, // Inject RedisService
  ) {
    // Attach service context to logs
    this.logger = this.baseLogger.child({ context: AuthService.name });
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<void> {
    const { email } = requestPasswordResetDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(SYS_MSG.NOT_FOUND);
    }

    const otpLength = this.configService.get<number>('OTP_LENGTH', 6);
    const otpExpirationMinutes = this.configService.get<number>(
      'OTP_EXPIRATION_MINUTES',
      10,
    );

    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10);
    }

    const otpKey = `otp:${email}`;
    await this.redisService.set(otpKey, otp, 'EX', otpExpirationMinutes * 60);

    this.logger.info(`OTP for ${email}: ${otp}`);
    // TODO: Integrate with an email service to send the OTP
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { email, otp, password } = resetPasswordDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(SYS_MSG.EMAIL_NOT_FOUND);
    }

    const otpKey = `otp:${email}`;
    const storedOtp = await this.redisService.get(otpKey);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException(SYS_MSG.INVALID_OTP);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.updatePassword(user.id, hashedPassword);

    await this.redisService.del(otpKey);
  }
}
