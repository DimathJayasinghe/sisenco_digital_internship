import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application with all security middleware.
 * See AGENTS/SECURITY_GUIDELINES.md for the full specification.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ── Global API prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Security: Helmet sets secure HTTP headers ──
  app.use(helmet());

  // ── Security: Cookie parser for HttpOnly JWT cookies ──
  app.use(cookieParser());

  // ── Security: CORS — only allow the trusted frontend origin ──
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // ── Validation: Global pipe with strict whitelist enforcement ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Start server ──
  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}/api/v1`);
}

bootstrap();
