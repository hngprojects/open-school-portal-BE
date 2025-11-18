import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import * as ExtractJwt from 'passport-jwt/lib/extract_jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secretKey: string =
      configService.get<string>('auth.jwtSecret') ?? 'defaultSecretKey';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  validate(payload: { sub: string; reg_no: string }) {
    return { userId: payload.sub, reg_no: payload.reg_no };
  }
}
