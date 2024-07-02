import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { AuthModule, SharedModule } from '@app/common';

@Module({
  imports: [
    AuthModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
