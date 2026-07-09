'use client';

import type { TrendPoint } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/hooks/useTheme';
import { formatWeekRange } from '@/lib/date';

interface TrendChartProps {
  data: TrendPoint[];
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
    line: '#7c3aed',
  },
  dark: {
    grid: '#27272a',
    axis: '#a1a1aa',
    tooltipBg: '#18181b',
    tooltipBorder: '#f4f4f5',
    label: '#f4f4f5',
    line: '#8b5cf6',
  },
};

/** Reports-submitted-per-week trend — AGENTS/UI_UX_DESIGN.md §5 Charts spec. */
export function TrendChart({ data }: TrendChartProps): ReactNode {
  const { theme } = useTheme();
  const colors = CHART_COLORS[theme];

  const chartData = data.map((point) => ({
    week: formatWeekRange(point.weekStartDate),
    reports: point.reportCount,
  }));

  return (
    <Card className="p-4">
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        Reports Submitted Over Time
      </p>
      <div
        role="img"
        aria-label={`Line chart of reports submitted per week: ${chartData
          .map((point) => `${point.week}, ${point.reports}`)
          .join('; ')}`}
        className="mt-4 h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis dataKey="week" stroke={colors.axis} tick={{ fontSize: 12 }} />
            <YAxis stroke={colors.axis} tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.tooltipBg,
                border: `2px solid ${colors.tooltipBorder}`,
                borderRadius: 0,
                fontSize: 13,
              }}
              labelStyle={{ color: colors.label }}
              itemStyle={{ color: colors.line }}
            />
            <Line
              type="monotone"
              dataKey="reports"
              stroke={colors.line}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
