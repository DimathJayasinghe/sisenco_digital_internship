'use client';

import type { Project, User } from '@sisenco/shared-types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Fragment, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAllReports } from '@/hooks/useReports';
import { formatWeekRange } from '@/lib/date';

interface ReportsTableProps {
  users: User[];
  projects: Project[];
}

/**
 * Filterable table of every team report. Rows expand on click to show the
 * actual report content (tasks, blockers, notes) — a manager scanning this
 * table needs to read blockers, not just see a status badge (PROJECT_IDEA.md's
 * Manager Journey: "Reads individual reports to identify blockers").
 */
export function ReportsTable({ users, projects }: ReportsTableProps): ReactNode {
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: reports,
    isLoading,
    isError,
  } = useAllReports({
    userId: userId || undefined,
    projectId: projectId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">All Team Reports</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Member" value={userId} onChange={(event) => setUserId(event.target.value)}>
          <option value="">All members</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </option>
          ))}
        </Select>
        <Select
          label="Project"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Input
          label="From"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <Input
          label="To"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>

      <div className="mt-4 max-h-[32rem] overflow-y-auto overflow-x-auto">
        {isLoading ? (
          <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
        ) : isError ? (
          <p className="py-6 text-sm text-red-600 dark:text-red-400">Couldn&apos;t load reports.</p>
        ) : !reports || reports.length === 0 ? (
          <p className="py-6 text-sm text-zinc-600 dark:text-zinc-400">
            No reports match these filters.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0">
              <tr className="border-b-2 border-zinc-900 dark:border-zinc-300 bg-zinc-200 dark:bg-zinc-700 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                <th className="w-8 px-4 py-2.5" aria-hidden />
                <th className="px-4 py-2.5 text-left">Member</th>
                <th className="px-4 py-2.5 text-left">Project</th>
                <th className="px-4 py-2.5 text-left">Week</th>
                <th className="px-4 py-2.5 text-left">Hours</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const isExpanded = expandedId === report.id;
                const rowLabel = `${report.user.firstName} ${report.user.lastName}, ${report.project.name}, ${formatWeekRange(report.weekStartDate)}`;
                return (
                  <Fragment key={report.id}>
                    <tr className="border-b border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${rowLabel}`}
                          className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        {report.user.firstName} {report.user.lastName}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {report.project.name}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {formatWeekRange(report.weekStartDate)}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-400">
                        {report.hoursWorked ?? '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={report.status}>{report.status}</Badge>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900">
                        <td colSpan={6} className="px-4 py-4">
                          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Tasks completed
                              </dt>
                              <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                                {report.tasksCompleted}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Tasks planned
                              </dt>
                              <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                                {report.tasksPlanned}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Blockers
                              </dt>
                              <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                                {report.blockers}
                              </dd>
                            </div>
                          </dl>
                          {report.notesOrLinks && (
                            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                              <span className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Notes:{' '}
                              </span>
                              {report.notesOrLinks}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
