'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ENPS_COLORS } from '@/lib/chart-colors';
import { useTranslations } from 'next-intl';

const chartConfig = {
  promoters: { label: 'Promoters', color: ENPS_COLORS.promoter },
  passives: { label: 'Passives', color: ENPS_COLORS.passive },
  detractors: { label: 'Detractors', color: ENPS_COLORS.detractor },
} satisfies ChartConfig;

interface ENPSGaugeProps {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export function ENPSGauge({ score, promoters, passives, detractors }: ENPSGaugeProps) {
  const t = useTranslations('dashboard');

  const data = [
    { name: t('promoters'), value: promoters, fill: ENPS_COLORS.promoter },
    { name: t('passives'), value: passives, fill: ENPS_COLORS.passive },
    { name: t('detractors'), value: detractors, fill: ENPS_COLORS.detractor },
  ];

  return (
    <div role="img" aria-label={`ENPS gauge: score ${score}. ${promoters}% promoters, ${passives}% passives, ${detractors}% detractors`}>
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <PieChart accessibilityLayer>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            startAngle={200}
            endAngle={-20}
            innerRadius="65%"
            outerRadius="88%"
            strokeWidth={3}
            stroke="hsl(var(--background))"
            paddingAngle={1.5}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={(viewBox.cy || 0) + 4} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 2} className="fill-foreground text-3xl font-semibold tabular-nums">
                        {score}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-[11px]">
                        {t('enps')}
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
      {/* Legend */}
      <div className="flex items-center justify-center gap-5 -mt-4">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            <span className="text-[11px] font-medium tabular-nums">{entry.value}%</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/50 mt-1">
        {t('enpsBaseline')}
      </p>
    </div>
  );
}
