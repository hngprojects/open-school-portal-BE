import * as crypto from 'crypto';

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import config from 'src/config/config';

import { EmailTemplateID } from '../../constants/email-constants';
import * as sysMsg from '../../constants/system.messages';
import { EmailService } from '../email/email.service';
import { EmailPayload } from '../email/email.types';
import { SessionService } from '../session/session.service';
import { UserService } from '../user/user.service';

import { AuthDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly sessionService: SessionService,
  ) {
    this.logger = logger.child({ context: AuthService.name });
  }

  async signup(signupPayload: AuthDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(
      signupPayload.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      signupPayload.password,
      saltRounds,
    );

    // Create user
    const newUser = await this.userService.create({
      ...signupPayload,
      password: hashedPassword,
    });

    // Create session in DB first
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newSession = await this.sessionService.create({
      user_id: newUser.id,
      refresh_token: '',
      expires_at: expiresAt,
      provider: 'jwt',
      is_active: true,
    });

    // Generate tokens with sessionId
    const tokens = await this.generateTokens(
      newUser.id,
      newUser.email,
      newUser.role,
      newSession.id,
    );
    const refreshTokenHash = await this.hashRefreshToken(tokens.refresh_token);
    // Update session with hashed refresh token
    await this.sessionService.updateSession(
      { refresh_token: refreshTokenHash },
      { id: newSession.id },
      { useTransaction: false },
    );

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
      ...tokens,
      session_id: newSession.id,
      session_expires_at: newSession.expires_at,
    };
  }

  async login(loginPayload: LoginDto) {
    // Find user by email
    const user = await this.userService.findByEmail(loginPayload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginPayload.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create session in DB first
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const newSession = await this.sessionService.create({
      user_id: user.id,
      refresh_token: '',
      expires_at: expiresAt,
      provider: 'jwt',
      is_active: true,
    });

    // Generate tokens with sessionId
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      newSession.id,
    );
    const refreshTokenHash = await this.hashRefreshToken(tokens.refresh_token);
    // Update session with hashed refresh token
    await this.sessionService.updateSession(
      { refresh_token: refreshTokenHash },
      { id: newSession.id },
      { useTransaction: false },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      ...tokens,
      session_id: newSession.id,
      session_expires_at: newSession.expires_at,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: config().jwt.refreshSecret,
      });

      // Find the session by user and compare refresh token using bcrypt
      const session = await this.sessionService.findByRefreshToken(
        payload.sub,
        refreshToken,
      );

      // Check if session exists and is valid
      if (!session) {
        this.logger.warn('Refresh token session not found');
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if session is active
      if (!session.is_active) {
        this.logger.warn('Refresh token session is inactive');
        throw new UnauthorizedException('Session is no longer active');
      }

      // Check if session is expired
      if (new Date() > session.expires_at) {
        this.logger.warn('Refresh token session has expired');

        await this.sessionService.updateSession(
          {
            is_active: false,
            revoked_at: new Date(),
          },
          { id: session.id },
          { useTransaction: false },
        );

        throw new UnauthorizedException('Session has expired');
      }

      // Check if session was revoked
      if (session.revoked_at) {
        this.logger.warn('Refresh token session was revoked');
        throw new UnauthorizedException('Session was revoked');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      // Create new session
      let sessionInfo = null;
      if (tokens.refresh_token) {
        const newRefreshTokenHash = await this.hashRefreshToken(
          tokens.refresh_token,
        );
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const newSession = await this.sessionService.create({
          user_id: payload.sub,
          refresh_token: newRefreshTokenHash,
          expires_at: expiresAt,
          provider: 'jwt',
          is_active: true,
        });

        sessionInfo = {
          session_id: newSession.id,
          expires_at: newSession.expires_at,
        };
      }

      return {
        ...tokens,
        session_id: sessionInfo?.session_id,
        session_expires_at: sessionInfo?.expires_at,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Invalid refresh token: ', error?.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.info(
        `Password reset requested for non-existent email: ${email}`,
      );
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Check if user is active
    if (!user.is_active) {
      this.logger.warn(
        `Password reset requested for inactive account: ${email}`,
      );
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.userService.updateUser(
      {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
      { id: user.id },
      { useTransaction: false },
    );

    const emailPayload: EmailPayload = {
      to: [{ name: user.first_name, email: user.email }],
      subject: 'Password Reset Request',
      templateNameID: EmailTemplateID.FORGOT_PASSWORD,
      templateData: {
        name: user.first_name,
        otp: resetToken,
        resetTokenExpiry,
      },
    };
    this.emailService.sendMail(emailPayload);
    this.logger.info(`Password reset token for ${email}: ${resetToken}`);

    return {
      message: 'Password reset token has been sent',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    const user = await this.userService.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
      throw new BadRequestException('Reset token has expired');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.userService.updateUser(
      {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
      { id: user.id },
      { useTransaction: false },
    );

    this.logger.info(`Password successfully reset for user: ${user.email}`);

    return { message: 'Password has been successfully reset' };
  }

  async activateUserAccount(id: string) {
    const user = await this.userService.findOne(id);

    if (!user) throw new NotFoundException(sysMsg.USER_NOT_FOUND);

    if (user.is_active) {
      return sysMsg.USER_IS_ACTIVATED;
    }

    await this.userService.updateUser(
      {
        is_active: true,
      },
      { id },
      { useTransaction: false },
    );

    return sysMsg.USER_ACTIVATED;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string[],
    sessionId?: string,
  ) {
    const { jwt } = config();
    const payload = { sub: userId, email, role, sessionId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwt.secret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: jwt.refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async cleanupExpiredSessions(): Promise<{ cleaned_count: number }> {
    this.logger.warn('Session cleanup not implemented in AuthService');
    return { cleaned_count: 0 };
  }

  private async hashRefreshToken(refreshToken: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(refreshToken, saltRounds);
  }
}
