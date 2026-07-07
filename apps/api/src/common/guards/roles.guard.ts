import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser, Role } from '@sisenco/shared-types';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Authorizes a request against the roles declared via @Roles(). The role is read
 * from the JWT-populated `request.user`, never from client input. Use together
 * with the JWT auth guard, which must run first to populate `request.user`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions for this resource');
    }

    return true;
  }
}
