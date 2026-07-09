import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Bigger offset shadow for the single most emphasized card on a page (AGENTS/UI_UX_DESIGN.md §6). */
  hero?: boolean;
}

/** Solid surface + hard offset shadow — AGENTS/UI_UX_DESIGN.md §4. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hero = false, ...props },
  ref,
): ReactNode {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-none border-2 border-zinc-900 bg-white p-6 dark:border-zinc-300 dark:bg-zinc-800',
        hero
          ? 'shadow-brutal-lg dark:shadow-brutal-lg-dark'
          : 'shadow-brutal dark:shadow-brutal-dark',
        className,
      )}
      {...props}
    />
  );
});
