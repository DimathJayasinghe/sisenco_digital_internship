'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/reports', label: 'My Report' },
  { href: '/history', label: 'History' },
];

/** Top navbar for the (member) route group — AGENTS/UI_UX_DESIGN.md §7. */
export function Navbar(): ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isError } = useCurrentUser();
  const logout = useLogout();

  // Defense in depth beyond middleware.ts — e.g. a token that expires mid-session.
  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  function handleLogout(): void {
    logout.mutate(undefined, { onSuccess: () => router.replace('/login') });
  }

  return (
    <header className="border-b border-white/10 bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/reports" className="text-sm font-semibold tracking-tight text-zinc-100">
            Weekly Reports
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden text-sm text-zinc-400 sm:inline">
              {user.firstName} {user.lastName}
            </span>
          )}
          <Button variant="ghost" onClick={handleLogout} disabled={logout.isPending}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
