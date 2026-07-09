'use client';

import type { WorkloadSlice } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';

interface WorkloadChartProps {
  data: WorkloadSlice[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '2px solid #f4f4f5',
  borderRadius: 0,
  fontSize: 13,
};

/** Report count per project — AGENTS/UI_UX_DESIGN.md §5 Charts spec. */
export function WorkloadChart({ data }: WorkloadChartProps): ReactNode {
  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-100">Workload by Project</p>
      <div
        role="img"
        aria-label={`Bar chart of report count by project: ${data
          .map((slice) => `${slice.projectName}, ${slice.reportCount}`)
          .join('; ')}`}
        className="mt-4 h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid stroke="#27272a" vertical={false} />
            <XAxis dataKey="projectName" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
            <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: '#f4f4f5' }}
              itemStyle={{ color: '#a78bfa' }}
              formatter={(value: number) => [value, 'Reports']}
            />
            <Bar dataKey="reportCount" name="Reports" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
