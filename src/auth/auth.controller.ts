import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GoogleAuthGuard, LocalAuthGuard } from './auth.guard';
import type { GoogleAuthUser, JwtSignProps } from './types/type.jwt';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  register(@Body() registerAuthDto: AuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  login(
    @Request() req: JwtSignProps,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = this.authService.loginWithJwt(req);

    res.cookie('access_token', access_token, {
      httpOnly: true,
    });

    return {
      message: 'Login successful',
    };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @Request() req: Request & { user: GoogleAuthUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, fullname } = req.user;
    const authDto: AuthDto = {
      email: email!,
      username: fullname,
    };

    const { access_token } = await this.authService.loginWithProvider(authDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
    });

    res.redirect('/');
  }
}
