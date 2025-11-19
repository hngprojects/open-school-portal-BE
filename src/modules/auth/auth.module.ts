import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { SessionsService } from '../sessions/sessions.service';
import { SessionsController } from '../sessions/sessions.controller';
import { Session } from '../sessions/entities/session.entity';
import { SessionsModule } from '../sessions/sessions.module';


@Module({
  imports: [
    UserModule,
    EmailModule,
    TypeOrmModule.forFeature([Session]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    SessionsModule,
  ],
  controllers: [AuthController, SessionsController],
  providers: [AuthService, UserService, SessionsService],
  exports: [AuthService],
})
export class AuthModule {}
