import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, switchMap, catchError } from 'rxjs';

import { UserJwt } from '../interfaces/user-jwt.interface';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();

    const cookie = request.cookies.Authentication;

    if (!cookie) next.handle();

    return this.authService
      .send<UserJwt>({ cmd: 'decode-jwt' }, { cookie })
      .pipe(
        switchMap((user) => {
          request.user = user;
          return next.handle();
        }),
        catchError(() => next.handle()),
      );
  }
}
