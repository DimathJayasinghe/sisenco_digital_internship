'use client';

import { Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

/** Light/dark toggle — AGENTS/UI_UX_DESIGN.md §10. Sits in the Navbar/Sidebar account area. */
export function ThemeToggle(): ReactNode {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-none border-2 border-transparent p-2 text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
