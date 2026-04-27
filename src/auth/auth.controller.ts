import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LocalAuthGuard } from './auth.guard';
import type { JwtSignProps } from './types/type.jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  login(@Request() req: JwtSignProps) {
    const { access_token } = this.authService.loginWithJwt(req);
    return { access_token };
  }
}
