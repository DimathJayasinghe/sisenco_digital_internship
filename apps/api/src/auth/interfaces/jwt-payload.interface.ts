import { Role } from '@sisenco/shared-types';

/** Shape encoded into the access-token JWT. `sub` is the standard subject claim (user id). */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
