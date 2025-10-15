import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  // Trust CLOUDFLARE/PROXIES
  app.set('trust proxy', 1);

  // Use environment variable for frontend origin
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://sokirka.com',
    'https://www.sokirka.com',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
