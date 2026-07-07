/** Name of the HttpOnly cookie carrying the stateless access-token JWT. */
export const ACCESS_TOKEN_COOKIE = 'access_token';

/** bcrypt cost factor for password hashing (SECURITY_GUIDELINES.md §1 — minimum 12). */
export const BCRYPT_ROUNDS = 12;

/** Minimum password length accepted at registration. */
export const MIN_PASSWORD_LENGTH = 8;

/** bcrypt truncates input beyond 72 bytes; reject longer input explicitly instead of silently truncating. */
export const MAX_PASSWORD_LENGTH = 72;
