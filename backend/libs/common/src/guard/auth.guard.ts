import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return false;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const cookie = request.cookies.Authentication;

    if (!cookie) return false;

    try {
      const { userId, sessionId, exp } = await firstValueFrom(
        this.authService.send<{
          userId: string;
          sessionId: string;
          exp: number;
        }>({ cmd: 'verify-jwt' }, { cookie }),
      );

      const currentTime = Math.floor(Date.now() / 1000);

      if (currentTime < exp) {
        return true;
      }

      const refreshToken = request.cookies.Refresh;

      if (!refreshToken) throw new UnauthorizedException();

      const { jwt: newJwt, refreshToken: newRefreshToken } =
        await firstValueFrom(
          this.authService.send<{ jwt: string; refreshToken: string }>(
            { cmd: 'refresh-jwt' },
            { userId, sessionId, refreshToken },
          ),
        );

      response.cookie('Authentication', newJwt, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      response.cookie('Refresh', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      return true;
    } catch (error) {
      console.error('Auth guard error: ', error);
      throw new UnauthorizedException();
    }
  }
}
