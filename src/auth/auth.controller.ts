import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LocalAuthGuard } from './auth.guard';
import type { JwtSignProps } from './types/type.jwt';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  register(@Body() registerAuthDto: RegisterAuthDto) {
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
}
