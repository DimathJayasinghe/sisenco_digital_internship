import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 * The user is attached by JwtAuthGuard after token validation.
 *
 * @example
 * @Get('me')
 * getProfile(@CurrentUser() user: IJwtPayload) { return user; }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
