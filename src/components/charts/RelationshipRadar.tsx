'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getPerformanceZone } from '@/lib/performance-zones';
import { useTranslations } from 'next-intl';
import type { RelationshipScoreData } from '@/lib/types/analytics';

interface RelationshipRadarProps {
  data: RelationshipScoreData;
}

const RADAR_COLOR = 'hsl(220 70% 55%)';
const RADAR_FILL = 'hsl(220 70% 55% / 0.15)';

export function RelationshipRadar({ data }: RelationshipRadarProps) {
  const t = useTranslations('dashboard');

  function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { relationship: string; score: number } }> }) {
    if (!active || !payload?.length) return null;
    const { relationship, score } = payload[0].payload;
    const zone = getPerformanceZone(score);
    return (
      <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1">
        <p className="font-medium text-foreground">{relationship}</p>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold tabular-nums">{score}%</span>
          <span className="px-1 py-0.5 rounded text-[10px] font-medium" style={{ color: zone.color, backgroundColor: zone.bgColor }}>
            {t(zone.labelKey)}
          </span>
        </div>
        <p className="text-muted-foreground/70 italic max-w-[180px]">{t(zone.descriptionKey)}</p>
      </div>
    );
  }
  const chartData = data.scores.map(s => ({
    relationship: s.relationship.replace(' (', '\n('),
    score: s.score,
    fullLabel: s.relationship,
  }));

  return (
    <div role="img" aria-label={`Relationship axes: ${data.scores.map(s => `${s.relationship} ${s.score}%`).join(', ')}`}>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData} margin={{ top: 16, right: 32, bottom: 16, left: 32 }}>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.4} strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="relationship" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} tickCount={5} />
          <Tooltip content={<CustomTooltip />} />
          <Radar name="Score" dataKey="score" stroke={RADAR_COLOR} fill={RADAR_FILL} strokeWidth={2} dot={{ r: 4, fill: RADAR_COLOR, strokeWidth: 0 }} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Performance summary with zone indicators */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
        {data.scores.map(s => {
          const zone = getPerformanceZone(s.score);
          return (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
              <span className="text-[11px] text-muted-foreground">{s.relationship.split(' (')[0]}</span>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: zone.color }}>{s.score}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
