import type { ReportWithRelations } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatWeekRange } from '@/lib/date';

interface ActivityFeedProps {
  data: ReportWithRelations[];
}

export function ActivityFeed({ data }: ActivityFeedProps): ReactNode {
  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recent Activity</p>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No submissions yet.</p>
      ) : (
        <div className="mt-3 max-h-72 overflow-y-auto">
          <ul className="divide-y divide-zinc-300 dark:divide-zinc-700">
            {data.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between gap-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-zinc-800 dark:text-zinc-200">
                    {report.user.firstName} {report.user.lastName}
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {' '}
                      · {report.project.name}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatWeekRange(report.weekStartDate)}
                  </p>
                </div>
                <Badge variant={report.status}>{report.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
