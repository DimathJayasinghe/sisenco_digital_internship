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
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/users', label: 'Team' },
];

/** Collapsible sidebar for the (manager) route group — AGENTS/UI_UX_DESIGN.md §5/§7. */
export function Sidebar(): ReactNode {
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

  function handleLogout(): void {
    logout.mutate(undefined, { onSuccess: () => router.replace('/login') });
  }

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {NAV_LINKS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'rounded-none border-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-zinc-900 bg-violet-600 text-white dark:border-zinc-100'
                : 'border-transparent text-zinc-600 hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const accountFooter = (
    <div className="border-t-2 border-zinc-900 p-4 dark:border-zinc-100">
      {user && (
        <p className="mb-2 truncate text-sm text-zinc-700 dark:text-zinc-300">
          {user.firstName} {user.lastName}
        </p>
      )}
      <div className="mb-2 flex justify-center">
        <ThemeToggle />
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={handleLogout}
        disabled={logout.isPending}
      >
        Sign out
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-zinc-100 px-4 py-3 dark:border-zinc-100 dark:bg-zinc-900 md:hidden">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Weekly Reports
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-none border-2 border-transparent p-2 text-zinc-600 hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="flex flex-col border-b-2 border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900 md:hidden">
          {navLinks}
          {accountFooter}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r-2 border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900 md:flex">
        <div className="px-4 py-5">
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Weekly Reports
          </span>
          <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">Manager</p>
        </div>
        {navLinks}
        {accountFooter}
      </aside>
    </>
  );
}
