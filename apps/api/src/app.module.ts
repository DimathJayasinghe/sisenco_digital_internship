import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformResponseInterceptor } from './common/interceptors';

/**
 * Root application module.
 * Registers global config, Prisma, rate limiting, response formatting,
 * and exception handling.
 *
 * Feature modules (auth, users, reports, projects, dashboard, ai)
 * will be added here as they are implemented.
 */
@Module({
  imports: [
    // ── Environment config ──
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Rate limiting (SECURITY_GUIDELINES.md §4) ──
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // ── Database ──
    PrismaModule,
  ],
  providers: [
    // ── Global rate limiter guard ──
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // ── Global exception filter ──
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // ── Global response interceptor ──
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
