'use client';

import type { MemberStatusRow } from '@sisenco/shared-types';
import { Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface StatusListProps {
  data: MemberStatusRow[];
}

/**
 * Per-member submission status for the current week. This is one categorical
 * value per person, not a series — Recharts doesn't have a chart type that
 * reads better than a plain list for that, so this is a list, not a chart.
 *
 * Search + a capped height with internal scroll keep this from pushing the
 * page arbitrarily tall as the team grows — a large roster used to make the
 * whole dashboard (and the sticky sidebar's "Sign out") scroll far off-screen.
 */
export function StatusList({ data }: StatusListProps): ReactNode {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((member) =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(query),
    );
  }, [data, search]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Team Status This Week</p>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{data.length} members</span>
      </div>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No team members yet.</p>
      ) : (
        <>
          {data.length > 5 && (
            <div className="relative mt-3">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400"
                aria-hidden
              />
              <Input
                label="Search team status"
                className="py-1.5 pl-8 text-xs"
                placeholder="Search members…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          )}
          <div className="mt-3 max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
                No members match &ldquo;{search}&rdquo;.
              </p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((member) => (
                  <li key={member.userId} className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
                      {member.firstName} {member.lastName}
                    </span>
                    <Badge variant={member.status}>{member.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
