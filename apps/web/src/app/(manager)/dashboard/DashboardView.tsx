'use client';

import type { ReactNode } from 'react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ReportsTable } from '@/components/dashboard/ReportsTable';
import { StatusList } from '@/components/dashboard/StatusList';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { WorkloadChart } from '@/components/dashboard/WorkloadChart';
import {
  useDashboardActivity,
  useDashboardStatus,
  useDashboardSummary,
  useDashboardTrend,
  useDashboardWorkload,
} from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';

const PERCENT_MULTIPLIER = 100;

function formatPercent(rate: number): string {
  return `${Math.round(rate * PERCENT_MULTIPLIER)}%`;
}

export function DashboardView(): ReactNode {
  const summary = useDashboardSummary();
  const trend = useDashboardTrend();
  const status = useDashboardStatus();
  const workload = useDashboardWorkload();
  const activity = useDashboardActivity();
  const users = useUsers();
  const projects = useProjects();

  const isLoading =
    summary.isLoading ||
    trend.isLoading ||
    status.isLoading ||
    workload.isLoading ||
    activity.isLoading ||
    users.isLoading ||
    projects.isLoading;
  const isError =
    summary.isError ||
    trend.isError ||
    status.isError ||
    workload.isError ||
    activity.isError ||
    users.isError ||
    projects.isError;

  if (isLoading) {
    return <p className="p-6 text-sm text-zinc-400">Loading dashboard…</p>;
  }

  if (
    isError ||
    !summary.data ||
    !trend.data ||
    !status.data ||
    !workload.data ||
    !activity.data ||
    !users.data ||
    !projects.data
  ) {
    return (
      <p className="p-6 text-sm text-red-400">Couldn&apos;t load the dashboard. Try refreshing.</p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Team Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">
        This week&apos;s submission activity across the team.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Submitted This Week"
          value={`${summary.data.submittedMembers} / ${summary.data.expectedMembers}`}
        />
        <MetricCard
          label="Compliance Rate"
          value={formatPercent(summary.data.complianceRate)}
          hero
        />
        <MetricCard
          label="Open Blockers"
          value={String(summary.data.openBlockers)}
          valueClassName={summary.data.openBlockers > 0 ? 'text-amber-400' : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendChart data={trend.data} />
        <WorkloadChart data={workload.data} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusList data={status.data} />
        <ActivityFeed data={activity.data} />
      </div>

      <div className="mt-6">
        <ReportsTable users={users.data} projects={projects.data} />
      </div>
    </div>
  );
}
