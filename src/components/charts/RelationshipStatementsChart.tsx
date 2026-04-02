'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { getPerformanceZone } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { RelationshipStatementBreakdown } from '@/lib/types/analytics';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface RelationshipStatementsChartProps {
  data: RelationshipStatementBreakdown[];
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  colleagues: 'hsl(155 45% 45%)',
  job: 'hsl(25 75% 55%)',
  management: 'hsl(220 70% 55%)',
};

const TAB_LABELS: Record<string, string> = {
  colleagues: 'Colleagues',
  job: 'Their Job',
  management: 'Management',
};

export function RelationshipStatementsChart({ data }: RelationshipStatementsChartProps) {
  const t = useTranslations('dashboard');

  function StatementTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; score: number } }> }) {
    if (!active || !payload?.length) return null;
    const { label, score } = payload[0].payload;
    const zone = getPerformanceZone(score);
    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1 max-w-[280px]">
        <p className="font-medium text-foreground leading-snug">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums">{score}%</span>
          <span style={{ color: zone.color }}>{t(zone.labelKey)}</span>
        </div>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState(data[0]?.key ?? 'colleagues');

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noRelationshipData')}
      </p>
    );
  }

  const activeGroup = data.find(d => d.key === activeTab) ?? data[0];
  const color = RELATIONSHIP_COLORS[activeGroup.key] ?? 'hsl(220 70% 55%)';
  const zone = getPerformanceZone(activeGroup.averageScore);

  // Build chart data — limit label length for readability
  const chartData = activeGroup.statements.map(s => ({
    id: s.id,
    label: s.label,
    score: s.score,
  }));

  const chartHeight = Math.max(180, chartData.length * 36 + 32);

  return (
    <div
      role="img"
      aria-label={`Relationship statements: ${activeGroup.relationship} — ${activeGroup.statements.map(s => `${s.id} ${s.score}%`).join(', ')}`}
    >
      {/* Tab navigation */}
      <div className="flex items-center gap-2 mb-4">
        {data.map(group => (
          <button
            key={group.key}
            type="button"
            onClick={() => setActiveTab(group.key)}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === group.key
                ? 'bg-foreground text-background'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {t(group.key === 'colleagues' ? 'colleagues' : group.key === 'job' ? 'theirJob' : 'management')}
          </button>
        ))}

        <span className="ml-auto text-[11px] text-muted-foreground">
          {t('avg')}:&nbsp;
          <span
            className="font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: zone.bgColor, color: zone.color }}
          >
            {activeGroup.averageScore}%
          </span>
        </span>
      </div>

      <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 52, bottom: 4, left: 8 }}
          barGap={4}
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
          <ChartTooltip content={<StatementTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={22} fill={color}>
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

      {/* Description */}
      <p className="text-[11px] text-muted-foreground mt-2">
        {activeGroup.statements.length} {t('statements')} · {activeGroup.relationship}
      </p>
    </div>
  );
}
