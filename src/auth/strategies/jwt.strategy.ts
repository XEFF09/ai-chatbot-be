import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload, JwtSignProps } from '../types/type.jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string => {
          return request?.cookies?.access_token as string;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  validate(payload: JwtPayload): JwtSignProps {
    const { sub, email, role } = payload;
    const res: JwtSignProps = {
      userId: sub,
      email: email,
      role: role,
    };
    return res;
  }
}
