import { NextRequest, NextResponse } from 'next/server';

/** Name of the HttpOnly cookie carrying the auth JWT (set by the API on login). */
const AUTH_COOKIE = 'access_token';

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ['/reports', '/history', '/dashboard', '/projects'];

/**
 * Frontend route protection (first line of defense; the API enforces auth/roles
 * authoritatively). Redirects unauthenticated users to /login.
 *
 * NOTE: Fine-grained role gating (redirecting Team Members away from the
 * manager routes /dashboard and /projects) requires verifying the JWT here —
 * wired up in the auth phase once the token shape/secret are finalized.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/reports/:path*', '/history/:path*', '/dashboard/:path*', '/projects/:path*'],
};
