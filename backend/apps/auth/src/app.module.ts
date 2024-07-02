import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedService } from '@app/common/services/shared.service';
import { SharedModule } from '@app/common/modules/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt-strategy';
import { JwtGuard } from './guard/jwt.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule, User, UserSchema } from '@app/common';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [
    SharedModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        privateKey: configService.get('JWT_PRIVATE_KEY').replace(/\\n/g, '\n'),
        publicKey: configService.get('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
          algorithm: 'RS256',
          issuer: 'AUTH_SERVICE',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [
    JwtGuard,
    JwtStrategy,
    AppService,
    UserRepository,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class AppModule {}
