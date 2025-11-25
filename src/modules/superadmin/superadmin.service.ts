import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import * as sysMsg from '../../constants/system.messages';

import { CreateSuperadminDto } from './dto/create-superadmin.dto';
import { ForgotSuperadminPasswordDto } from './dto/forgot-superadmin-password.dto';
import { LoginSuperadminDto } from './dto/login-superadmin.dto';
import { ResetSuperadminPasswordDto } from './dto/reset-superadmin-password.dto';
import { SuperadminModelAction } from './model-actions/superadmin-actions';

@Injectable()
export class SuperadminService {
  constructor(
    // private readonly superAdminRepo: Repository<SuperAdmin>,
    private readonly superadminModelAction: SuperadminModelAction,
    private readonly dataSource: DataSource,
  ) {}

  async createSuperAdmin(createSuperadminDto: CreateSuperadminDto) {
    const { password, confirm_password, email, ...restData } =
      createSuperadminDto;

    if (!password || !confirm_password) {
      throw new ConflictException(sysMsg.SUPERADMIN_PASSWORDS_REQUIRED);
    }

    const existing = await this.superadminModelAction.get({
      identifierOptions: { email: createSuperadminDto.email },
    });

    if (existing) {
      throw new ConflictException(sysMsg.SUPERADMIN_EMAIL_EXISTS);
    }

    const passwordHash: string = await bcrypt.hash(password, 10);

    const createdSuperadmin = await this.dataSource.transaction(
      async (manager) => {
        const newSuperadmin = await this.superadminModelAction.create({
          createPayload: {
            ...restData,
            email,
            password: passwordHash,
            isActive: createSuperadminDto.schoolName ? true : false,
          },
          transactionOptions: { useTransaction: true, transaction: manager },
        });
        return newSuperadmin;
      },
    );

    if (createdSuperadmin.password) delete createdSuperadmin.password;

    return {
      message: sysMsg.SUPERADMIN_ACCOUNT_CREATED,
      status_code: HttpStatus.CREATED,
      data: createdSuperadmin,
    };
  }

  /**
   * Logs in user
   * @param loginSuperadminDto - requires data with which a superadmin is logged on
   */
  async login(loginSuperadminDto: LoginSuperadminDto) {
    // Find superadmin by email
    const superadmin = await this.superadminModelAction.get({
      identifierOptions: { email: loginSuperadminDto.email },
    });
    if (!superadmin) {
      throw new ConflictException(sysMsg.INVALID_CREDENTIALS);
    }

    // Check if active (assuming isActive field)
    if (!superadmin.isActive) {
      throw new ConflictException(sysMsg.USER_INACTIVE);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginSuperadminDto.password,
      superadmin.password,
    );

    if (!isPasswordValid) {
      throw new ConflictException(sysMsg.INVALID_CREDENTIALS);
    }

    // TODO: Generate JWT or session if needed
    // Return basic info for now
    return {
      message: sysMsg.LOGIN_SUCCESS,
      data: {
        id: superadmin.id,
        email: superadmin.email,
        firstName: superadmin.firstName,
        lastName: superadmin.lastName,
        schoolName: superadmin.schoolName,
      },
      status_code: HttpStatus.OK,
    };
  }

  /**
   * logs out a logged on superadmin
   */
  async logout() {
    // TODO: Implement session/token revocation if needed
    return { message: sysMsg.LOGOUT_SUCCESS };
  }

  /**
   * sends a reset password email to the provided email, having
   * confirmed that the email exists
   *
   * @param forgotSuperadminPasswordDto - contains the email to which the
   * password reset email is sent
   */
  async forgotPassword(
    forgotSuperadminPasswordDto: ForgotSuperadminPasswordDto,
  ) {
    const { email } = forgotSuperadminPasswordDto;
    const superadmin = await this.superadminModelAction.get({
      identifierOptions: { email },
    });

    if (!superadmin) {
      // For security, do not reveal if email exists
      return { message: sysMsg.PASSWORD_RESET_SENT };
    }

    // Generate reset token and expiry
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token and expiry
    await this.superadminModelAction.update({
      updatePayload: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
      identifierOptions: { id: superadmin.id },
      transactionOptions: { useTransaction: false },
    });

    // TODO: Send email with resetToken (stub)
    // await this.emailService.sendMail({ ... })

    return { message: sysMsg.PASSWORD_RESET_SENT };
  }

  /**
   * assists a superadmin user to be able to change their password
   * after validating a given jwt token, which has been sent to a
   * user's email through the forgot password method
   *
   * @param resetSuperadminPasswordDto - contains the jwt, new_password,
   * and new_password_confirmation
   */
  async resetPassword(resetSuperadminPasswordDto: ResetSuperadminPasswordDto) {
    const { jwt, password, confirm_password } = resetSuperadminPasswordDto;
    // TODO: Verify JWT and extract superadmin id/email
    // For now, treat jwt as reset token
    const superadmin = await this.superadminModelAction.get({
      identifierOptions: { reset_token: jwt },
    });
    if (!superadmin) {
      throw new ConflictException(sysMsg.PASSWORD_RESET_TOKEN_INVALID);
    }
    if (
      superadmin.reset_token_expiry &&
      new Date() > superadmin.reset_token_expiry
    ) {
      throw new ConflictException(sysMsg.PASSWORD_RESET_TOKEN_EXPIRED);
    }
    if (password !== confirm_password) {
      throw new ConflictException(sysMsg.SUPERADMIN_PASSWORDS_REQUIRED);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.superadminModelAction.update({
      updatePayload: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
      identifierOptions: { id: superadmin.id },
      transactionOptions: { useTransaction: false },
    });
    return { message: sysMsg.PASSWORD_RESET_SUCCESS };
  }
}
