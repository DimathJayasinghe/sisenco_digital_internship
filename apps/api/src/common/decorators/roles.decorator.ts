import { SetMetadata } from '@nestjs/common';
import { Role } from '@sisenco/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given roles. Enforced by RolesGuard, which reads the
 * role from the validated JWT payload — never from the request body.
 *
 * @example @Roles(Role.MANAGER)
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
