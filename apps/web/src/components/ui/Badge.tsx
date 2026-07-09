import type { MemberSubmissionStatus, ReportStatus } from '@sisenco/shared-types';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = ReportStatus | MemberSubmissionStatus;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

// AGENTS/UI_UX_DESIGN.md §2 — outlined block badge, transparent background so
// it reads correctly on both zinc-950 and zinc-900 parents. DRAFT uses the
// muted zinc-500 border floor (§9) instead of a status color, since it's
// inactive, not one of the "colored" outcomes.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  SUBMITTED: 'border-emerald-500 text-emerald-400',
  LATE: 'border-red-500 text-red-400',
  PENDING: 'border-amber-500 text-amber-400',
  DRAFT: 'border-zinc-500 text-zinc-400',
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
