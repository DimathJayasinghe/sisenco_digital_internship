import { Role } from './enums';

/**
 * A user as safely exposed by the API. Never includes `passwordHash`.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** Minimal user reference embedded in other resources (e.g. a report's author). */
export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** Authenticated principal decoded from the JWT payload. */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
