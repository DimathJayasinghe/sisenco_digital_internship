'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/reports', label: 'My Report' },
  { href: '/history', label: 'History' },
  { href: '/profile', label: 'Profile' },
];

/**
 * Top navbar for the (member) route group — AGENTS/UI_UX_DESIGN.md §7.
 * Below `sm`, links/name/sign-out collapse into a hamburger panel (mirrors
 * Sidebar's mobile pattern) — a single row can't fit three nav links plus
 * the theme toggle and sign-out without overflowing at phone widths.
 */
export function Navbar(): ReactNode {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isError } = useCurrentUser();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Defense in depth beyond middleware.ts — e.g. a token that expires mid-session.
  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  // Close the mobile panel on navigation so it doesn't stay open over the next page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout(): void {
    logout.mutate(undefined, { onSuccess: () => router.replace('/login') });
  }

  function renderLinks(linkClassName: string): ReactNode {
    return NAV_LINKS.map((link) => {
      const isActive = pathname.startsWith(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            linkClassName,
            isActive
              ? 'border-zinc-900 bg-violet-600 text-white dark:border-zinc-300'
              : 'border-transparent text-zinc-600 hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
          )}
        >
          {link.label}
        </Link>
      );
    });
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
          <nav className="hidden items-center gap-1 sm:flex">
            {renderLinks(
              'whitespace-nowrap rounded-none border-2 px-3 py-1.5 text-sm font-medium transition-colors',
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          {user && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.firstName} {user.lastName}
            </span>
          )}
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout} disabled={logout.isPending}>
            Sign out
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-none border-2 border-transparent p-2 text-zinc-600 hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t-2 border-zinc-900 bg-zinc-100 p-3 dark:border-zinc-300 dark:bg-zinc-900 sm:hidden">
          {renderLinks('rounded-none border-2 px-3 py-2 text-sm font-medium transition-colors')}
          {user && (
            <p className="mt-2 truncate px-3 text-sm text-zinc-600 dark:text-zinc-400">
              {user.firstName} {user.lastName}
            </p>
          )}
          <Button
            variant="secondary"
            className="mt-1 w-full"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
}
