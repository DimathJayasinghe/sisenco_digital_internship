'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useMyReports } from '@/hooks/useReports';
import { formatWeekRange } from '@/lib/date';

/** Report history — GET /reports/my already returns newest-first (ReportsService.findMine). */
export function HistoryList(): ReactNode {
  const { data: reports, isLoading, isError } = useMyReports();

  if (isLoading) {
    return <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="mt-8 text-sm text-red-600 dark:text-red-400">
        Couldn&apos;t load your report history.
      </p>
    );
  }

  if (!reports || reports.length === 0) {
    return <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">No reports yet.</p>;
  }

  return (
    <div className="mt-8 space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {formatWeekRange(report.weekStartDate)}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {report.project.name}
              </p>
            </div>
            <Badge variant={report.status}>{report.status}</Badge>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Tasks completed
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {report.tasksCompleted}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Tasks planned
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {report.tasksPlanned}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Blockers
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {report.blockers}
              </dd>
            </div>
            {report.hoursWorked !== null && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Hours worked
                </dt>
                <dd className="mt-1 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {report.hoursWorked}
                </dd>
              </div>
            )}
            {report.notesOrLinks && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Notes
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {report.notesOrLinks}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      ))}
    </div>
  );
}
