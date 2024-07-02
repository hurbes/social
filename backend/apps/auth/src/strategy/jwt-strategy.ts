import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRequest } from '../dto/jwt-request.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: JwtRequest) => {
          return request?.cookie;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
      algorithms: ['RS256'],
      expiresIn: configService.get('JWT_EXPIRATION'),
    });
  }

  async validate(payload: any) {
    return { ...payload };
  }
}
