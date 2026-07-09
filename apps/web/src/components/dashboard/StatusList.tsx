import type { MemberStatusRow } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface StatusListProps {
  data: MemberStatusRow[];
}

/**
 * Per-member submission status for the current week. This is one categorical
 * value per person, not a series — Recharts doesn't have a chart type that
 * reads better than a plain list for that, so this is a list, not a chart.
 */
export function StatusList({ data }: StatusListProps): ReactNode {
  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Team Status This Week</p>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No team members yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((member) => (
            <li key={member.userId} className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {member.firstName} {member.lastName}
              </span>
              <Badge variant={member.status}>{member.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
