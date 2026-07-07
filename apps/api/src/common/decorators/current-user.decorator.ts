import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '@sisenco/shared-types';
import { Request } from 'express';

/**
 * Injects the authenticated principal (populated by the JWT strategy) into a
 * handler param. Optionally narrow to a single field: `@CurrentUser('id')`.
 */
export const CurrentUser = createParamDecorator(
  (
    field: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const user = request.user;
    return field ? user[field] : user;
  },
);
