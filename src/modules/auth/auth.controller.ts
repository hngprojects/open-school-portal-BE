import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AUTH_LIMIT } from '../../config/throttle.config';
import * as sysMsg from '../../constants/system.messages';

import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  RefreshTokenResponseDto,
  SignupResponseDto,
} from './dto/auth-response.dto';
import {
  AuthDto,
  AuthMeResponseDto,
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: AUTH_LIMIT })
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: sysMsg.ACCOUNT_CREATED,
    type: SignupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: sysMsg.ACCOUNT_ALREADY_EXISTS,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: sysMsg.VALIDATION_ERROR,
  })
  signup(@Body() signupDto: AuthDto) {
    return this.authService.signup(signupDto);
  }

  @Throttle({ default: AUTH_LIMIT })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.LOGIN_SUCCESS,
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: sysMsg.INVALID_CREDENTIALS,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: sysMsg.VALIDATION_ERROR,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Throttle({ default: AUTH_LIMIT })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.TOKEN_REFRESH_SUCCESS,
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: sysMsg.TOKEN_INVALID,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: sysMsg.VALIDATION_ERROR,
  })
  refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Throttle({ default: AUTH_LIMIT })
  @Post('forgot-password')
  forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authService.forgotPassword(payload);
  }

  @Throttle({ default: AUTH_LIMIT })
  @Post('reset-password')
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }

  @Patch('users/:user_id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: sysMsg.ACTIVATE_ACCOUNT })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.USER_ACTIVATED,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: sysMsg.USER_NOT_FOUND,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: sysMsg.TOKEN_INVALID,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: sysMsg.PERMISSION_DENIED,
  })
  async activateAccount(@Param('user_id') userId: string) {
    const message = await this.authService.activateUserAccount(userId);
    return {
      status: HttpStatus.OK,
      message,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetches authenticated user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: sysMsg.PROFILE_RETRIEVED,
    type: AuthMeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: sysMsg.UNAUTHORIZED,
  })
  async getProfile(@Headers('authorization') authorization: string) {
    return this.authService.getProfile(authorization);
  }
}
