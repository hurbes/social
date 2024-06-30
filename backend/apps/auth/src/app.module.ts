import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationOptions: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
      envFilePath: '.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
