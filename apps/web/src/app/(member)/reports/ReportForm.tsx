'use client';

import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useProjects } from '@/hooks/useProjects';
import { useMyReports } from '@/hooks/useReports';
import { formatWeekRange, getMondayOf, shiftIsoDate, toIsoDate } from '@/lib/date';
import { ReportFormFields } from './ReportFormFields';

const WEEK_DAYS = 7;

export function ReportForm(): ReactNode {
  const [weekStartDate, setWeekStartDate] = useState(() => toIsoDate(getMondayOf(new Date())));

  const { data: reports, isLoading: reportsLoading, isError: reportsError } = useMyReports();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const existingReport = reports?.find((report) => report.weekStartDate === weekStartDate);
  const isLoading = reportsLoading || projectsLoading;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">My Weekly Report</h1>
      <p className="mt-2 text-sm text-zinc-400">
        One report per week. Save as a draft as you go, then submit when it&apos;s ready.
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWeekStartDate((current) => shiftIsoDate(current, -WEEK_DAYS))}
        >
          ← Previous week
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-100">{formatWeekRange(weekStartDate)}</p>
          {existingReport && (
            <Badge variant={existingReport.status} className="mt-1">
              {existingReport.status}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setWeekStartDate((current) => shiftIsoDate(current, WEEK_DAYS))}
        >
          Next week →
        </Button>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm text-zinc-400">Loading…</p>
      ) : reportsError ? (
        <p className="mt-8 text-sm text-red-400">
          Couldn&apos;t load your reports. Try refreshing.
        </p>
      ) : (
        <ReportFormFields
          key={weekStartDate}
          weekStartDate={weekStartDate}
          report={existingReport}
          projects={projects}
        />
      )}
    </div>
  );
}
