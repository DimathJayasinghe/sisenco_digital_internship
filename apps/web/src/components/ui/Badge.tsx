import type { MemberSubmissionStatus, ReportStatus } from '@sisenco/shared-types';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = ReportStatus | MemberSubmissionStatus;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

// AGENTS/UI_UX_DESIGN.md §2 — translucent status chip pattern. DRAFT is solid
// zinc (inactive), not tinted, since it isn't one of the "colored" outcomes.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  SUBMITTED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  LATE: 'border-red-500/20 bg-red-500/10 text-red-400',
  PENDING: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  DRAFT: 'border-zinc-700 bg-zinc-800 text-zinc-400',
};

/** Report/submission status badge — AGENTS/UI_UX_DESIGN.md §5. */
export function Badge({ variant, className, children, ...props }: BadgeProps): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
