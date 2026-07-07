import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { ProjectsModule } from './projects/projects.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';

const SECONDS = 1000;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 100 requests / 60s. Stricter per-route limits (auth)
    // are applied with @Throttle() on those controllers.
    ThrottlerModule.forRoot([{ ttl: 60 * SECONDS, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    ProjectsModule,
    DashboardModule,
    AiModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
