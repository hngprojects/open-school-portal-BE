import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { AuthDocs } from './docs/auth.docs';
import { LoginUserBodyValidator } from './validators/login-user.validator';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @AuthDocs.login()
  @HttpCode(200)
  @Post('login')
  async login(@Body() user: LoginUserBodyValidator) {
    return this.authService.loginUser(user);
  }
}
