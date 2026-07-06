import { RoleName } from './enums';

/**
 * Role entity — maps to the `roles` database table.
 */
export interface IRole {
  readonly id: string;
  readonly name: RoleName;
  readonly description: string | null;
}

/**
 * User entity — maps to the `users` database table.
 * NOTE: `passwordHash` is NEVER included in API responses.
 */
export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly roleId: string;
  readonly role?: IRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Login request payload.
 */
export interface ILoginRequest {
  readonly email: string;
  readonly password: string;
}

/**
 * Registration request payload.
 */
export interface IRegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

/**
 * JWT payload embedded in the access token.
 */
export interface IJwtPayload {
  readonly sub: string;
  readonly email: string;
  readonly role: RoleName;
}
