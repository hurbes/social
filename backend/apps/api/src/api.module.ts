import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule, SharedModule } from '@app/common';

@Module({
  imports: [
    AuthModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('POST_SERVICE', process.env.RABBITMQ_POST_QUEUE),
    SharedModule.registerRmq(
      'COMMENT_SERVICE',
      process.env.RABBITMQ_COMMENT_QUEUE,
    ),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
