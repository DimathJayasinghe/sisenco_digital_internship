import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@sisenco/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are permitted to access a route.
 * Used in conjunction with RolesGuard.
 *
 * @example
 * @Roles(RoleName.MANAGER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * findAll() { ... }
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
