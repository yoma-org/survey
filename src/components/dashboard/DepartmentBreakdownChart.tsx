'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DepartmentBreakdownData } from '@/lib/types/analytics';

interface DepartmentBreakdownChartProps {
  data: DepartmentBreakdownData;
}

const DIMENSION_ORDER = ['Credibility', 'Respect', 'Fairness', 'Pride', 'Camaraderie'];

// Segment colors — cycling through 4 distinct hues
const SEGMENT_COLORS = [
  'hsl(220 70% 55%)',  // soft blue
  'hsl(255 55% 58%)',  // muted violet
  'hsl(175 45% 45%)',  // teal
  'hsl(25 75% 55%)',   // warm amber
];

interface TooltipEntry {
  name?: string;
  value?: number | string | null;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md text-xs">
      <p className="font-medium text-foreground mb-2">{label}</p>
      {payload.map((entry, i) => {
        const isInsufficient = entry.value === null || entry.value === undefined;
        return (
          <div key={`${entry.name ?? ''}-${i}`} className="flex items-center gap-2 py-0.5">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color ?? '#888' }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {isInsufficient ? 'Insufficient data (< 5 responses)' : `${entry.value}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DepartmentBreakdownChart({ data }: DepartmentBreakdownChartProps) {
  if (data.segments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No department data available
      </p>
    );
  }

  // Build recharts data — one entry per dimension, one key per segment label
  const chartData = DIMENSION_ORDER.map((dim) => {
    const entry: Record<string, string | number | null> = { dimension: dim };
    for (const seg of data.segments) {
      const found = seg.dimensions.find((d) => d.dimension === dim);
      entry[seg.segmentLabel] = found?.score ?? null;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
        barGap={4}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          type="category"
          dataKey="dimension"
          width={90}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
        {data.segments.map((seg, index) => (
          <Bar
            key={seg.segmentLabel}
            dataKey={seg.segmentLabel}
            fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
            radius={[0, 3, 3, 0]}
            maxBarSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
