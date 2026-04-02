'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { getPerformanceZone, INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { MultiSurveyData } from '@/lib/types/analytics';

const chartConfig = {
  eesScore: { label: 'EES Score' },
  gptwScore: { label: 'GPTW Score' },
} satisfies ChartConfig;

interface EESTrendChartProps {
  data: MultiSurveyData;
}

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

export function EESTrendChart({ data }: EESTrendChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1.5">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, i) => {
          if (entry.value === null || entry.value === undefined) return null;
          const zone = getPerformanceZone(entry.value);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold tabular-nums">{entry.value}%</span>
              <span style={{ color: zone.color }} className="text-[10px]">{t(zone.labelKey)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (data.surveys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noHistoricalData')}
      </p>
    );
  }

  const chartData = data.surveys.map(s => ({
    name: `${s.year}`,
    label: s.surveyName,
    eesScore: s.eesScore,
    gptwScore: s.gptwScore,
  }));

  const eesBenchmark = INDUSTRY_BENCHMARKS['EES'] ?? 80;

  return (
    <div
      role="img"
      aria-label={`EES trend: ${data.surveys.map(s => `${s.year} ${s.eesScore}%`).join(', ')}`}
    >
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <ComposedChart data={chartData} margin={{ top: 20, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
            domain={[40, 100]}
            width={44}
          />
          <ReferenceLine
            y={eesBenchmark}
            stroke="hsl(0 0% 60%)"
            strokeDasharray="8 4"
            strokeWidth={1.5}
            label={{ value: `Benchmark ${eesBenchmark}%`, position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="eesScore" name="EES Score" radius={[5, 5, 0, 0]} maxBarSize={56}>
            {chartData.map((entry) => {
              const zone = getPerformanceZone(entry.eesScore);
              return <Cell key={entry.name} fill={zone.color} />;
            })}
          </Bar>
          <Line
            type="monotone"
            dataKey="gptwScore"
            name="GPTW Score"
            stroke="hsl(255 55% 58%)"
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(255 55% 58%)' }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ChartContainer>
      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-muted-foreground/50" />
          {t('benchmark')} {eesBenchmark}%
        </span>
        {data.surveys.map(s => {
          const zone = getPerformanceZone(s.eesScore);
          return (
            <span key={s.surveyId} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
              {s.year}: {s.eesScore}%
            </span>
          );
        })}
      </div>
    </div>
  );
}
