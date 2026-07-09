import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  /** The compliance-rate treatment — biggest number on the page, per AGENTS/UI_UX_DESIGN.md §6. */
  hero?: boolean;
  valueClassName?: string;
}

export function MetricCard({
  label,
  value,
  hero = false,
  valueClassName,
}: MetricCardProps): ReactNode {
  return (
    <Card className="p-4" hero={hero}>
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-bold tabular-nums tracking-tight',
          hero
            ? 'text-4xl text-violet-600 dark:text-violet-400 md:text-5xl'
            : 'text-3xl text-zinc-900 dark:text-zinc-100',
          valueClassName,
        )}
      >
        {value}
      </p>
    </Card>
  );
}
