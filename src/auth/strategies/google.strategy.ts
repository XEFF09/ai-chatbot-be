import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '../../config/config.service';
import { GoogleAuthUser } from '../types/type.jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.googleOauth.clientId,
      clientSecret: configService.googleOauth.clientSecret,
      callbackURL: `${configService.api.baseUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, photos } = profile;
    const { givenName, familyName } = profile.name || {};

    const googleAuthUser: GoogleAuthUser = {
      googleId: id,
      email: emails?.[0]?.value,
      fullname: `${givenName} ${familyName}`,
      picture: photos?.[0]?.value,
      accessToken,
    };
    done(null, googleAuthUser);
  }
}
