import { NestFactory } from '@nestjs/core';
import { PostsModule } from './posts.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(PostsModule);
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_POST_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();

  await app.listen(3500);
}
bootstrap();
