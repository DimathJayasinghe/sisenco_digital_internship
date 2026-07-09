import type { MemberSubmissionStatus, ReportStatus } from '@sisenco/shared-types';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = ReportStatus | MemberSubmissionStatus;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

// AGENTS/UI_UX_DESIGN.md §2 — outlined block badge, transparent background so
// it reads correctly on any surface in either theme. Light-mode status
// colors run one to two shades darker than dark-mode's (emerald/red/amber-500
// don't clear 4.5:1 AA text contrast on a light background — 700 does; see
// §9). DRAFT uses the muted zinc-500 border floor (§9, safe in both themes)
// instead of a status color, since it's inactive, not a "colored" outcome.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  SUBMITTED: 'border-emerald-700 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400',
  LATE: 'border-red-700 text-red-700 dark:border-red-500 dark:text-red-400',
  PENDING: 'border-amber-700 text-amber-700 dark:border-amber-500 dark:text-amber-400',
  DRAFT: 'border-zinc-500 text-zinc-600 dark:text-zinc-400',
};

/** Report/submission status badge — AGENTS/UI_UX_DESIGN.md §5. */
export function Badge({ variant, className, children, ...props }: BadgeProps): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border-2 bg-transparent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
