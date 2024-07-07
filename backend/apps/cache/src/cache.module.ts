import { Module } from '@nestjs/common';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisService, SharedModule, SharedService } from '@app/common';

@Module({
  imports: [
    SharedModule,
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URI,
      options: {
        password: process.env.REDIS_PASS,
      },
    }),
    SharedModule.registerRmq('POST_SERVICE', process.env.RABBITMQ_POST_QUEUE),
    SharedModule.registerRmq(
      'COMMENT_SERVICE',
      process.env.RABBITMQ_COMMENT_QUEUE,
    ),
  ],
  controllers: [CacheController],
  providers: [
    CacheService,
    RedisService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
  ],
})
export class CacheModule {}
