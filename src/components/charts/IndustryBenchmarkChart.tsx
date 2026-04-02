'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { getPerformanceZone } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { IndustryBenchmarkData } from '@/lib/types/analytics';

const chartConfig = {
  score: { label: 'Our Score', color: 'hsl(220 70% 55%)' },
  benchmark: { label: 'GPTW Benchmark', color: 'hsl(0 0% 72%)' },
} satisfies ChartConfig;

interface IndustryBenchmarkChartProps {
  data: IndustryBenchmarkData;
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  color?: string;
  payload?: { name: string; score: number; benchmark: number; gap: number };
}

function GapAnnotation({ x, y, width, height, value }: { x?: number; y?: number; width?: number; height?: number; value?: number }) {
  if (value === undefined || value === null || x === undefined || y === undefined || width === undefined || height === undefined) return null;
  const isAbove = value >= 0;
  return (
    <text
      x={(x + width) + 6}
      y={y + height / 2}
      fill={isAbove ? 'hsl(155 50% 38%)' : 'hsl(15 80% 50%)'}
      fontSize={9}
      fontWeight={600}
      dominantBaseline="middle"
    >
      {isAbove ? `+${value}` : String(value)}
    </text>
  );
}

export function IndustryBenchmarkChart({ data }: IndustryBenchmarkChartProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    if (!item) return null;
    const zone = getPerformanceZone(item.score);
    const gapLabel = item.gap >= 0
      ? `+${item.gap} ${t('aboveBenchmark')}`
      : `${item.gap} ${t('belowBenchmark')}`;

    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1.5">
        <p className="font-medium text-foreground">{item.name}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
          <span className="text-muted-foreground">{t('ourScore')}:</span>
          <span className="font-semibold tabular-nums">{item.score}%</span>
          <span style={{ color: zone.color }}>{t(zone.labelKey)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          <span className="text-muted-foreground">{t('benchmark')}:</span>
          <span className="font-semibold tabular-nums">{item.benchmark}%</span>
        </div>
        <p className={`text-[10px] font-medium ${item.gap >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
          {gapLabel}
        </p>
      </div>
    );
  }

  if (data.dimensions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noBenchmarkData')}
      </p>
    );
  }

  // Combine dimensions + overall metrics
  const allItems = [
    ...data.dimensions,
    ...data.overall,
  ];

  const chartData = allItems.map(item => ({
    name: item.name,
    score: item.score,
    benchmark: item.benchmark,
    gap: item.gap,
  }));

  return (
    <div
      role="img"
      aria-label={`Industry benchmark comparison: ${allItems.map(d => `${d.name} our ${d.score}% vs benchmark ${d.benchmark}%`).join(', ')}`}
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 32, bottom: 4, left: 0 }}
          barGap={3}
          barCategoryGap="22%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={40}
          />
          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />

          {/* Our score — zone-colored */}
          <Bar dataKey="score" name="Our Score" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {chartData.map((entry, idx) => {
              const zone = getPerformanceZone(entry.score);
              return <Cell key={idx} fill={zone.color} />;
            })}
            <LabelList
              dataKey="gap"
              content={<GapAnnotation />}
            />
          </Bar>

          {/* Benchmark — muted gray */}
          <Bar
            dataKey="benchmark"
            name="GPTW Benchmark"
            fill="hsl(0 0% 72%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ChartContainer>

      {/* Gap legend */}
      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-600" />
          {t('aboveBenchmark')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          {t('belowBenchmark')}
        </span>
        <span className="text-[9px]">{t('gapAnnotation')}</span>
      </div>
    </div>
  );
}
