'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
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
    <header className="border-b-2 border-zinc-900 bg-zinc-100 dark:border-zinc-300 dark:bg-zinc-900">
      <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/reports"
            className="whitespace-nowrap text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            <span className="sm:hidden">WR</span>
            <span className="hidden sm:inline">Weekly Reports</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'whitespace-nowrap rounded-none border-2 px-2 py-1.5 text-sm font-medium transition-colors sm:px-3',
                    isActive
                      ? 'border-zinc-900 bg-violet-600 text-white dark:border-zinc-300'
                      : 'border-transparent text-zinc-600 hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
              {user.firstName} {user.lastName}
            </span>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            className="whitespace-nowrap px-2 sm:px-4"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
