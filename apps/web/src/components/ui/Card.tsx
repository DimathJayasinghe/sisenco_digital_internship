import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

/** Glass surface primitive — AGENTS/UI_UX_DESIGN.md §4. Borders and a
 * one-step-lighter fill, never a shadow. */
export function Card({ className, ...props }: CardProps): ReactNode {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/5 p-6', className)} {...props} />
  );
}
