import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthUser } from '@sisenco/shared-types';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

function cookieExtractor(req: Request): string | null {
  return req.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
}

/**
 * Validates the JWT carried in the HttpOnly cookie and maps its payload to the
 * authenticated principal attached to `request.user`. No DB lookup here — the
 * signed payload is trusted for the lifetime of the (short, stateless) token.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
