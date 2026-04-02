'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { DIMENSION_COLORS, type DimensionName } from '@/lib/chart-colors';
import { getPerformanceZone, INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface DimensionBarChartProps {
  data: { dimension: string; score: number }[];
}

export function DimensionBarChart({ data }: DimensionBarChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { dimension: string; score: number } }> }) {
    if (!active || !payload?.length) return null;
    const { dimension, score } = payload[0].payload;
    const zone = getPerformanceZone(score);
    const benchmark = INDUSTRY_BENCHMARKS[dimension] ?? 78;
    const gap = score - benchmark;

    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1">
        <p className="font-medium text-foreground">{dimension}</p>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums">{score}%</span>
          <span style={{ color: zone.color }}>{t(zone.labelKey)}</span>
        </div>
        <p className="text-muted-foreground">
          {gap >= 0 ? '+' : ''}{gap} vs benchmark ({benchmark}%)
        </p>
      </div>
    );
  }
  const chartData = data.map((d) => ({
    ...d,
    fill: DIMENSION_COLORS[d.dimension as DimensionName] || DIMENSION_COLORS.Credibility,
  }));

  const avgBenchmark = Math.round(
    data.reduce((sum, d) => sum + (INDUSTRY_BENCHMARKS[d.dimension] ?? 78), 0) / data.length
  );

  return (
    <div role="img" aria-label={`Pillar performance: ${data.map(d => `${d.dimension} ${d.score}%`).join(', ')}`}>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer barGap={8} margin={{ top: 28, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis dataKey="dimension" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} width={40} />

          {/* Benchmark baseline — dashed line */}
          <ReferenceLine
            y={avgBenchmark}
            stroke="hsl(0 0% 60%)"
            strokeDasharray="8 4"
            strokeWidth={1.5}
          />

          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />

          <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.dimension} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="score"
              position="top"
              formatter={(v: unknown) => `${v}%`}
              className="fill-foreground text-xs font-medium"
              offset={6}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Baseline label below chart */}
      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-muted-foreground/50" />
          {t('benchmark')} {avgBenchmark}%
        </span>
        {data.map((d) => {
          const zone = getPerformanceZone(d.score);
          return (
            <span key={d.dimension} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
              {d.dimension}
            </span>
          );
        })}
      </div>
    </div>
  );
}
