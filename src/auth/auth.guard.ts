import { AuthGuard } from '@nestjs/passport';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtSignProps } from './types/type.jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient<Socket>();
    JwtAuthGuard.validateWsToken(client);

    return true;
  }

  static validateWsToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    const token: string = authorization?.split(' ')[1] || '';
    const payload = verify(token, process.env.JWT_SECRET as string);
    return payload;
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request: Request & { user: JwtSignProps } = context
      .switchToHttp()
      .getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
