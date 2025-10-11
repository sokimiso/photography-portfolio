import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Use environment variable for frontend origin
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://sokirka.com',
    'https://www.sokirka.com', // <-- add www
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(4000);
}
bootstrap();
