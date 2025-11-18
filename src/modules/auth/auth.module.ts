import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import authConfig from '../../config/auth.config';
import { User } from '../user/models/user.model';
import { UserModule } from '../user/user.module';
import { User2fa } from './entities/user-2fa.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, User2fa]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get('auth.jwtExpiry'),
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ConfigModule.forFeature(authConfig),
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [AuthService, JwtStrategy, TwoFactorAuthService],
  exports: [AuthService, TwoFactorAuthService],
})
export class AuthModule {}
