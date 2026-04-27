import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { JwtSignProps } from '../types/type.jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<JwtSignProps> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(`invalid credentials`);
    }

    return user;
  }
}
