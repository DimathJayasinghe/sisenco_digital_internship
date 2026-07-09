import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Bigger offset shadow for the single most emphasized card on a page (AGENTS/UI_UX_DESIGN.md §6). */
  hero?: boolean;
}

/** Solid surface + hard offset shadow — AGENTS/UI_UX_DESIGN.md §4. */
export function Card({ className, hero = false, ...props }: CardProps): ReactNode {
  return (
    <div
      className={cn(
        'rounded-none border-2 border-zinc-100 bg-zinc-900 p-6',
        hero ? 'shadow-brutal-lg' : 'shadow-brutal',
        className,
      )}
      {...props}
    />
  );
}
