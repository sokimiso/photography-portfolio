import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sokirka.home',
      'https://sokirka.com',
    ],
    credentials: true,
  });

  //app.setGlobalPrefix('api');

  await app.listen(4000);

}
bootstrap();
