import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { RedisIoAdapter } from './adapter/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3004);
}
bootstrap();
