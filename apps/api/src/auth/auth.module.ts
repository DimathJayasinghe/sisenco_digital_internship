import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule — registration, login/logout, JWT issuance & validation strategy.
 * The route guard itself (JwtAuthGuard) lives in common/guards since it is
 * bound globally in AppModule.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        // JWT_EXPIRES_IN is a jsonwebtoken duration string (e.g. "7d"); jsonwebtoken's
        // types narrow `expiresIn` to a template-literal union, which a generic
        // `string` can't satisfy statically — validated at runtime by jsonwebtoken itself.
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d'),
        } as JwtModuleOptions['signOptions'],
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
