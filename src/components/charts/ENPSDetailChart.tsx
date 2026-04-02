'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ENPS_COLORS } from '@/lib/chart-colors';
import { useTranslations } from 'next-intl';
import type { ENPSDetailData } from '@/lib/types/analytics';

const chartConfig = {
  promoters: { label: 'Promoters', color: ENPS_COLORS.promoter },
  passives: { label: 'Passives', color: ENPS_COLORS.passive },
  detractors: { label: 'Detractors', color: ENPS_COLORS.detractor },
} satisfies ChartConfig;

interface ENPSDetailChartProps {
  data: ENPSDetailData;
}

export function ENPSDetailChart({ data }: ENPSDetailChartProps) {
  const t = useTranslations('dashboard');

  const pieData = [
    { name: t('promoters'), value: data.promoters, fill: ENPS_COLORS.promoter },
    { name: t('passives'), value: data.passives, fill: ENPS_COLORS.passive },
    { name: t('detractors'), value: data.detractors, fill: ENPS_COLORS.detractor },
  ];

  return (
    <div
      role="img"
      aria-label={`eNPS from PRI-31 and PRI-35: score ${data.score}. ${data.promoters}% promoters, ${data.passives}% passives, ${data.detractors}% detractors`}
    >
      <p className="text-[11px] text-muted-foreground mb-2">
        {t('enpsFromStatements')}
      </p>
      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <PieChart accessibilityLayer>
          <Pie
            data={pieData}
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
            {pieData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={(viewBox.cy || 0) + 4} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) - 2}
                        className="fill-foreground text-3xl font-semibold tabular-nums"
                      >
                        {data.score}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 20}
                        className="fill-muted-foreground text-[11px]"
                      >
                        eNPS
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
      <div className="flex items-center justify-center gap-4 -mt-3">
        {pieData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-[11px] text-muted-foreground">{entry.name}</span>
            <span className="text-[11px] font-medium tabular-nums">{entry.value}%</span>
          </div>
        ))}
      </div>

      {/* Per-statement breakdown */}
      <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
        <p className="text-[11px] font-medium text-muted-foreground mb-2">{t('byStatement')}</p>
        {data.statementScores.map(stmt => (
          <div key={stmt.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-foreground/70 leading-tight max-w-[180px]">
                {stmt.label}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{stmt.id}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
              <div
                className="h-full"
                style={{ width: `${stmt.promoters}%`, backgroundColor: ENPS_COLORS.promoter }}
                title={`${t('promoters')}: ${stmt.promoters}%`}
              />
              <div
                className="h-full"
                style={{ width: `${stmt.passives}%`, backgroundColor: ENPS_COLORS.passive }}
                title={`${t('passives')}: ${stmt.passives}%`}
              />
              <div
                className="h-full"
                style={{ width: `${stmt.detractors}%`, backgroundColor: ENPS_COLORS.detractor }}
                title={`${t('detractors')}: ${stmt.detractors}%`}
              />
            </div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span>{stmt.promoters}% {t('promoter')}</span>
              <span>{stmt.passives}% {t('passive')}</span>
              <span>{stmt.detractors}% {t('detractor')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
