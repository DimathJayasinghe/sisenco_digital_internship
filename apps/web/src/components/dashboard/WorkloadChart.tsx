'use client';

import type { WorkloadSlice } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';

interface WorkloadChartProps {
  data: WorkloadSlice[];
}

// Recharts takes raw hex via inline style/props, not Tailwind classes, so
// these can't pick up `dark:` variants — picked explicitly from the current
// theme instead. AGENTS/UI_UX_DESIGN.md §5 Charts spec.
const CHART_COLORS = {
  light: {
    grid: '#d4d4d8',
    axis: '#52525b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#18181b',
    label: '#18181b',
    bar: '#7c3aed',
  },
  dark: {
    grid: '#27272a',
    axis: '#a1a1aa',
    tooltipBg: '#18181b',
    tooltipBorder: '#f4f4f5',
    label: '#f4f4f5',
    bar: '#7c3aed',
  },
};

/** Report count per project — AGENTS/UI_UX_DESIGN.md §5 Charts spec. */
export function WorkloadChart({ data }: WorkloadChartProps): ReactNode {
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme];

  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Workload by Project</p>
      <div
        role="img"
        aria-label={`Bar chart of report count by project: ${data
          .map((slice) => `${slice.projectName}, ${slice.reportCount}`)
          .join('; ')}`}
        className="mt-4 h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis dataKey="projectName" stroke={colors.axis} tick={{ fontSize: 12 }} />
            <YAxis stroke={colors.axis} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `2px solid ${colors.tooltipBorder}`,
                borderRadius: 0,
                fontSize: 13,
              }}
              labelStyle={{ color: colors.label }}
              itemStyle={{ color: colors.bar }}
              formatter={(value: number) => [value, 'Reports']}
            />
            <Bar dataKey="reportCount" name="Reports" fill={colors.bar} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
