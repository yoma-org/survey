'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { DIMENSION_COLORS, type DimensionName } from '@/lib/chart-colors';
import { getPerformanceZone, INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface DimensionBarChartProps {
  data: { dimension: string; score: number }[];
}

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
        <span className="px-1 py-0.5 rounded text-[10px] font-medium" style={{ color: zone.color, backgroundColor: zone.bgColor }}>
          {zone.label}
        </span>
      </div>
      <p className="text-muted-foreground">
        {gap >= 0 ? '+' : ''}{gap}pts vs industry benchmark ({benchmark}%)
      </p>
      <p className="text-muted-foreground/70 italic">{zone.description}</p>
    </div>
  );
}

export function DimensionBarChart({ data }: DimensionBarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fill: DIMENSION_COLORS[d.dimension as DimensionName] || DIMENSION_COLORS.Credibility,
    benchmark: INDUSTRY_BENCHMARKS[d.dimension] ?? 78,
  }));

  // Overall benchmark line (average of dimension benchmarks)
  const avgBenchmark = Math.round(
    data.reduce((sum, d) => sum + (INDUSTRY_BENCHMARKS[d.dimension] ?? 78), 0) / data.length
  );

  return (
    <div role="img" aria-label={`Dimension performance: ${data.map(d => `${d.dimension} ${d.score}%`).join(', ')}`}>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer barGap={8} margin={{ top: 28, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis dataKey="dimension" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tickLine={false} axisLine={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} width={44} />

          {/* Industry benchmark reference line */}
          <ReferenceLine y={avgBenchmark} stroke="hsl(var(--muted-foreground))" strokeDasharray="6 4" strokeWidth={1} label={{ value: `Benchmark ${avgBenchmark}%`, position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />

          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />

          <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.dimension} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="score"
              position="top"
              formatter={(v) => `${v}%`}
              className="fill-foreground text-xs font-medium"
              offset={6}
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Performance zone legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-muted-foreground">
        <span className="font-medium">Performance:</span>
        {data.map((d) => {
          const zone = getPerformanceZone(d.score);
          return (
            <span key={d.dimension} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: zone.color }} />
              <span>{d.dimension}</span>
              <span className="font-medium" style={{ color: zone.color }}>{zone.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
