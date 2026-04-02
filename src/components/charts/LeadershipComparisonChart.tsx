'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import type { LeadershipComparisonData } from '@/lib/types/analytics';
import { useTranslations } from 'next-intl';

interface LeadershipComparisonChartProps {
  data: LeadershipComparisonData;
}

const MANAGER_COLOR = 'hsl(220 70% 55%)';
const IC_COLOR = 'hsl(155 45% 45%)';

interface TooltipEntry {
  name?: string;
  value?: number | null;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function LeadershipComparisonChart({ data }: LeadershipComparisonChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs">
        <p className="font-medium text-foreground mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.value === null || entry.value === undefined
                ? t('insufficientDataTooltip')
                : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  const chartData = data.pillars.map((pillar, i) => ({
    pillar,
    'People Manager': data.manager[i] ?? null,
    'Individual Contributor': data.ic[i] ?? null,
  }));

  const hasData = data.managerCount >= 5 || data.icCount >= 5;

  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('insufficientLeadershipComparison')}
      </p>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Leadership comparison: ${data.pillars.map((p, i) => `${p} Manager ${data.manager[i]}% IC ${data.ic[i]}%`).join(', ')}`}
    >
      <div className="flex gap-4 text-[11px] text-muted-foreground mb-3">
        <span>{t('managersLabel')} <strong className="text-foreground">{data.managerCount}</strong> responses</span>
        <span>{t('icsLabel')} <strong className="text-foreground">{data.icCount}</strong> responses</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
          barGap={4}
          barCategoryGap="25%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis
            dataKey="pillar"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <ReferenceLine y={78} stroke="hsl(0 0% 60%)" strokeDasharray="8 4" strokeWidth={1.5} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="People Manager"
            fill={MANAGER_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="Individual Contributor"
            fill={IC_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
