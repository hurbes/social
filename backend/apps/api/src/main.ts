import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors({
    origin: 'http://localhost:3003',
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
