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
import { formatWeekRange } from '@/lib/date';

interface TrendChartProps {
  data: TrendPoint[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 13,
};

/** Reports-submitted-per-week trend — AGENTS/UI_UX_DESIGN.md §5 Charts spec. */
export function TrendChart({ data }: TrendChartProps): ReactNode {
  const chartData = data.map((point) => ({
    week: formatWeekRange(point.weekStartDate),
    reports: point.reportCount,
  }));

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-zinc-100">Reports Submitted Over Time</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid stroke="#27272a" vertical={false} />
            <XAxis dataKey="week" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
            <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              labelStyle={{ color: '#f4f4f5' }}
              itemStyle={{ color: '#a78bfa' }}
            />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
