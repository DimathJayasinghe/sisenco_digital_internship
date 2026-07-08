'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
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
              'rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const accountFooter = (
    <div className="border-t border-white/10 p-4">
      {user && (
        <p className="mb-2 truncate text-sm text-zinc-300">
          {user.firstName} {user.lastName}
        </p>
      )}
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
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-950 px-4 py-3 md:hidden">
        <span className="text-sm font-semibold tracking-tight text-zinc-100">Weekly Reports</span>
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="flex flex-col border-b border-white/10 bg-zinc-950 md:hidden">
          {navLinks}
          {accountFooter}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-white/10 bg-zinc-950 md:flex">
        <div className="px-4 py-5">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">Weekly Reports</span>
          <p className="mt-0.5 text-xs text-zinc-500">Manager</p>
        </div>
        {navLinks}
        {accountFooter}
      </aside>
    </>
  );
}
