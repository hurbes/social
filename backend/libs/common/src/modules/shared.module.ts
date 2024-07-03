import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { SharedService } from '../services/shared.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: Joi.object({
        MONGODB_URI: Joi.string().required(),
        REDIS_URI: Joi.string().required(),
        RABBITMQ_USER: Joi.string().required(),
        RABBITMQ_PASS: Joi.string().required(),
        RABBITMQ_HOST: Joi.string().required(),
        RABBITMQ_POST_QUEUE: Joi.string().required(),
        RABBITMQ_COMMENT_QUEUE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_PUBLIC_KEY: Joi.string().required(),
      }),
    }),
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {
  static registerRmq(service: string, queue: string): DynamicModule {
    const providers = [
      {
        provide: service,
        useFactory: (configService: ConfigService) => {
          const USER = configService.get('RABBITMQ_USER');
          const PASSWORD = configService.get('RABBITMQ_PASS');
          const HOST = configService.get('RABBITMQ_HOST');

          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
              queue,
              queueOptions: {
                durable: true, // queue survives broker restart
              },
            },
          });
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: SharedModule,
      providers,
      exports: providers,
    };
  }
}
