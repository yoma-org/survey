'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SENTIMENT_COLORS } from '@/lib/chart-colors';
import { useTranslations } from 'next-intl';

const chartConfig = {
  positive: { label: 'Positive', color: SENTIMENT_COLORS.positive },
  neutral: { label: 'Neutral', color: SENTIMENT_COLORS.neutral },
  negative: { label: 'Negative', color: SENTIMENT_COLORS.negative },
} satisfies ChartConfig;

interface ResponseDonutChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function ResponseDonutChart({ positive, neutral, negative }: ResponseDonutChartProps) {
  const t = useTranslations('dashboard');

  const data = [
    { name: t('positive'), value: positive, fill: SENTIMENT_COLORS.positive },
    { name: t('neutral'), value: neutral, fill: SENTIMENT_COLORS.neutral },
    { name: t('negative'), value: negative, fill: SENTIMENT_COLORS.negative },
  ];

  return (
    <div role="img" aria-label={`Donut chart: ${positive}% positive, ${neutral}% neutral, ${negative}% negative`}>
      <ChartContainer config={chartConfig} className="h-[240px] w-full">
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="82%"
            strokeWidth={3}
            stroke="hsl(var(--background))"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 6} className="fill-foreground text-2xl font-semibold tabular-nums">
                        {positive}%
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground text-[11px]">
                        {t('positive')}
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      {/* Legend + baseline */}
      <div className="flex items-center justify-center gap-5 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            <span className="text-[11px] font-medium tabular-nums">{entry.value}%</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
        {t('positiveBaseline')}
      </p>
    </div>
  );
}
