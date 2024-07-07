import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat/chat.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule, SharedModule } from '@app/common';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [ChatController],
  providers: [ConfigService, ChatService, ChatGateway],
})
export class ChatModule {}
