import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformResponseInterceptor } from './common/interceptors';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Security headers + cookie parsing (auth JWT travels in an HttpOnly cookie).
  app.use(helmet());
  app.use(cookieParser());

  // Only the trusted frontend origin may call the API with credentials.
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // All routes under /api/v1.
  app.setGlobalPrefix('api/v1');

  // Strict validation on every DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Standard response envelope + sanitized error formatting.
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
}

void bootstrap();
