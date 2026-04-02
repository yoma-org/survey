'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { getPerformanceZone, INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { LeadershipConfidenceData } from '@/lib/types/analytics';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface LeadershipConfidenceChartProps {
  data: LeadershipConfidenceData;
}

export function LeadershipConfidenceChart({ data }: LeadershipConfidenceChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; score: number } }> }) {
    if (!active || !payload?.length) return null;
    const { label, score } = payload[0].payload;
    const zone = getPerformanceZone(score);
    const benchmark = INDUSTRY_BENCHMARKS['Credibility'] ?? 80;
    const gap = score - benchmark;

    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1 max-w-[260px]">
        <p className="font-medium text-foreground leading-snug">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums">{score}%</span>
          <span style={{ color: zone.color }}>{t(zone.labelKey)}</span>
        </div>
        <p className="text-muted-foreground">
          {gap >= 0 ? '+' : ''}{gap} vs Credibility benchmark ({benchmark}%)
        </p>
      </div>
    );
  }

  if (data.statements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('insufficientLeadership')}
      </p>
    );
  }

  const chartData = data.statements.map(s => ({
    id: s.id,
    label: s.label.length > 55 ? s.label.substring(0, 55) + '…' : s.label,
    score: s.score,
  }));

  const credBenchmark = INDUSTRY_BENCHMARKS['Credibility'] ?? 80;

  return (
    <div
      role="img"
      aria-label={`Leadership confidence: ${data.statements.map(s => `${s.id} ${s.score}%`).join(', ')}. Overall: ${data.overallScore}%`}
    >
      {/* Overall score badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] text-muted-foreground">{t('overallConfidence')}</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{
            backgroundColor: getPerformanceZone(data.overallScore).bgColor,
            color: getPerformanceZone(data.overallScore).color,
          }}
        >
          {data.overallScore}% — {t(getPerformanceZone(data.overallScore).labelKey)}
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 52, bottom: 4, left: 8 }}
          barGap={6}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="id"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            width={52}
          />
          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {chartData.map((entry, idx) => {
              const zone = getPerformanceZone(entry.score);
              return <Cell key={idx} fill={zone.color} />;
            })}
            <LabelList
              dataKey="score"
              position="right"
              formatter={(v: unknown) => `${v}%`}
              className="fill-foreground text-[10px] font-medium"
              offset={4}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Benchmark legend */}
      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-muted-foreground/50" />
          {t('credibilityBenchmark')} {credBenchmark}%
        </span>
      </div>
    </div>
  );
}
