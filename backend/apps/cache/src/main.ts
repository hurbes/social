import { NestFactory } from '@nestjs/core';
import { CacheModule } from './cache.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(CacheModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_CACHE_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();

  await app.listen(3005);
}
bootstrap();
