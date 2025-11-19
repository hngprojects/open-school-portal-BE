import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as sysMsg from '../../constants/system.messages';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AdminResetPasswordDto,
  AdminResetPasswordResponseDto,
} from './dto/admin-reset-password.dto';
import { ResetPasswordDto, ForgotPasswordDto, AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Mock Guards
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    adminResetPassword: jest.fn(),
    activateUserAccount: jest.fn(),
  };

  // Mock DTOs
  const mockSignupDto: AuthDto = {
    email: 'test@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    middle_name: 'Will',
    gender: 'male',
    dob: '26th November, 1990',
    phone: '',
    role: [],
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockResetPasswordDto: ResetPasswordDto = {
    token: 'valid-token',
    newPassword: 'newPassword123',
  };

  const mockForgotPasswordDto: ForgotPasswordDto = {
    email: 'test@example.com',
  };

  const mockAdminResetPasswordDto: AdminResetPasswordDto = {
    newPassword: 'adminResetPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should register a new user successfully', async () => {
      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: ['STUDENT'],
        },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(mockSignupDto);

      expect(authService.signup).toHaveBeenCalledWith(mockSignupDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when user already exists', async () => {
      mockAuthService.signup.mockRejectedValue(
        new BadRequestException('User with this email already exists'),
      );

      await expect(controller.signup(mockSignupDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.signup(mockSignupDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: ['STUDENT'],
        },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const expectedResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshToken);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid-refresh-token';

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(
        controller.refreshToken(invalidRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        controller.refreshToken(invalidRefreshToken),
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('forgotPassword', () => {
    it('should process forgot password request successfully', async () => {
      const expectedResult = { message: 'Password reset email sent' };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(mockForgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        mockForgotPasswordDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException for non-existent email', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.forgotPassword(mockForgotPasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.forgotPassword(mockForgotPasswordDto),
      ).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const message = 'Password has been successfully reset';
      const expectedResult = { message };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(mockResetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockResetPasswordDto,
      );
      expect(result).toEqual({
        message,
        // status: HttpStatus.OK,
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException('Invalid or expired reset token'),
      );

      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw BadRequestException for expired token', async () => {
      mockAuthService.resetPassword.mockRejectedValue(
        new BadRequestException('Reset token has expired'),
      );

      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.resetPassword(mockResetPasswordDto),
      ).rejects.toThrow('Reset token has expired');
    });
  });

  describe('adminResetPassword', () => {
    it('should reset password as admin successfully', async () => {
      const userId = 'user-uuid';
      const expectedResult: AdminResetPasswordResponseDto = {
        success: true,
        message: 'Password reset successfully',
        resetAt: new Date(),
      };

      mockAuthService.adminResetPassword.mockResolvedValue(expectedResult);

      const result = await controller.adminResetPassword(
        userId,
        mockAdminResetPasswordDto,
      );

      expect(authService.adminResetPassword).toHaveBeenCalledWith(
        userId,
        mockAdminResetPasswordDto.newPassword,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-uuid';

      mockAuthService.adminResetPassword.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.adminResetPassword(userId, mockAdminResetPasswordDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.adminResetPassword(userId, mockAdminResetPasswordDto),
      ).rejects.toThrow('User not found');
    });

    it('should throw ForbiddenException for insufficient permissions', async () => {
      const userId = 'user-uuid';

      mockAuthService.adminResetPassword.mockRejectedValue(
        new ForbiddenException('Insufficient permissions'),
      );

      await expect(
        controller.adminResetPassword(userId, mockAdminResetPasswordDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.adminResetPassword(userId, mockAdminResetPasswordDto),
      ).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('activateAccount', () => {
    it('should activate a user account and return a success message', async () => {
      const userId = 'some-uuid';
      const successMessage = sysMsg.USER_ACTIVATED;

      mockAuthService.activateUserAccount.mockResolvedValue(successMessage);

      const result = await controller.activateAccount(userId);

      expect(authService.activateUserAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: successMessage,
      });
    });

    it('should return a message indicating the user is already active', async () => {
      const userId = 'some-uuid';
      const successMessage = sysMsg.USER_IS_ACTIVATED;

      mockAuthService.activateUserAccount.mockResolvedValue(successMessage);

      const result = await controller.activateAccount(userId);

      expect(authService.activateUserAccount).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: successMessage,
      });
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      const userId = 'non-existent-uuid';

      mockAuthService.activateUserAccount.mockRejectedValue(
        new NotFoundException(sysMsg.USER_NOT_FOUND),
      );

      await expect(controller.activateAccount(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.activateAccount(userId)).rejects.toThrow(
        sysMsg.USER_NOT_FOUND,
      );
    });
  });

  // Test guard behavior if needed
  describe('Guard behavior', () => {
    it('should use mocked JwtAuthGuard', () => {
      expect(mockJwtAuthGuard.canActivate).toBeDefined();
    });

    it('should use mocked RolesGuard', () => {
      expect(mockRolesGuard.canActivate).toBeDefined();
    });
  });
});
