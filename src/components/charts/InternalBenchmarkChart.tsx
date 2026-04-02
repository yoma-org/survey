'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { INDUSTRY_BENCHMARKS } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { MultiSurveyData } from '@/lib/types/analytics';

interface InternalBenchmarkChartProps {
  data: MultiSurveyData;
}

// Stable year colors — up to 5 surveys
const YEAR_COLORS = [
  'hsl(220 10% 72%)',   // light gray (oldest)
  'hsl(220 70% 72%)',   // light blue
  'hsl(220 70% 55%)',   // blue (most recent)
  'hsl(255 55% 58%)',
  'hsl(155 45% 45%)',
];

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1.5">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry, i) => (
        entry.value !== null && entry.value !== undefined && (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold tabular-nums">{entry.value}%</span>
          </div>
        )
      ))}
    </div>
  );
}

export function InternalBenchmarkChart({ data }: InternalBenchmarkChartProps) {
  const t = useTranslations('dashboard');

  if (data.surveys.length < 2) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('internalBenchmarkMin')}
      </p>
    );
  }

  const dimensions = ['Camaraderie', 'Credibility', 'Fairness', 'Pride', 'Respect'];

  // Build chart data: one row per dimension, one bar key per survey year
  const chartData = dimensions.map(dim => {
    const row: Record<string, string | number> = { dimension: dim };
    for (const survey of data.surveys) {
      const dimData = survey.dimensions.find(d => d.dimension === dim);
      row[String(survey.year)] = dimData?.score ?? 0;
    }
    return row;
  });

  const avgBenchmark = Math.round(
    dimensions.reduce((sum, dim) => sum + (INDUSTRY_BENCHMARKS[dim] ?? 78), 0) / dimensions.length
  );

  // Build ChartConfig dynamically
  const chartConfig: ChartConfig = {};
  data.surveys.forEach((survey, idx) => {
    chartConfig[String(survey.year)] = {
      label: survey.surveyName,
      color: YEAR_COLORS[Math.min(idx, YEAR_COLORS.length - 1)],
    };
  });

  return (
    <div
      role="img"
      aria-label={`Internal benchmark: ${data.surveys.map(s => s.year).join(', ')} across ${dimensions.join(', ')}`}
    >
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 12, bottom: 4, left: 0 }}
          barGap={4}
          barCategoryGap="20%"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
          <XAxis
            dataKey="dimension"
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
            domain={[0, 100]}
            width={40}
          />
          <ReferenceLine
            y={avgBenchmark}
            stroke="hsl(0 0% 60%)"
            strokeDasharray="8 4"
            strokeWidth={1.5}
            label={{ value: `Benchmark ${avgBenchmark}%`, position: 'insideTopRight', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
          {data.surveys.map((survey, idx) => (
            <Bar
              key={survey.surveyId}
              dataKey={String(survey.year)}
              name={String(survey.year)}
              fill={YEAR_COLORS[Math.min(idx, YEAR_COLORS.length - 1)]}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          ))}
        </BarChart>
      </ChartContainer>

      <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-muted-foreground/50" />
          {t('industryBenchmark')} {avgBenchmark}%
        </span>
      </div>
    </div>
  );
}
