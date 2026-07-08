import { Role } from '@sisenco/shared-types';
import { NextRequest, NextResponse } from 'next/server';

/** Name of the HttpOnly cookie carrying the auth JWT (set by the API on login). */
const AUTH_COOKIE = 'access_token';

/** Routes any authenticated user may reach. */
const MEMBER_PREFIXES = ['/reports', '/history'];
/** Routes gated to MANAGER only. */
const MANAGER_PREFIXES = ['/dashboard', '/projects', '/users'];
const PROTECTED_PREFIXES = [...MEMBER_PREFIXES, ...MANAGER_PREFIXES];

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

/**
 * Decodes (never verifies) the JWT payload. This is a UX convenience only —
 * the backend's JwtAuthGuard/RolesGuard validate the signature authoritatively
 * on every request (SECURITY_GUIDELINES.md §2). A forged or expired token
 * might pass this check; it will always be rejected by the API itself.
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) {
      return null;
    }
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Frontend route protection (first line of defense; the API enforces auth/roles
 * authoritatively — SECURITY_GUIDELINES.md §2). Redirects unauthenticated users
 * to /login and TEAM_MEMBER users away from manager-only routes.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isManagerRoute = MANAGER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isManagerRoute && payload.role !== Role.MANAGER) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/reports/:path*',
    '/history/:path*',
    '/dashboard/:path*',
    '/projects/:path*',
    '/users/:path*',
  ],
};
