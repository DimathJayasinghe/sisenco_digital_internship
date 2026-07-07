import { Prisma } from '@prisma/client';
import { Role, User } from '@sisenco/shared-types';

export type UserWithRole = Prisma.UserGetPayload<{ include: { role: true } }>;

/**
 * Maps a Prisma user (with its `role` relation loaded) to the API-safe shape.
 * Never includes `passwordHash` (SECURITY_GUIDELINES.md §6).
 */
export function toSafeUser(user: UserWithRole): User {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    // Safe: the only roles ever seeded/assigned are Role enum members (DATABASE.md §3).
    role: user.role.name as Role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
