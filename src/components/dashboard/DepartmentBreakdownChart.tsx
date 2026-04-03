'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { DepartmentBreakdownData } from '@/lib/types/analytics';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DepartmentBreakdownChartProps {
  data: DepartmentBreakdownData;
}

const DIMENSION_ORDER = ['Credibility', 'Respect', 'Fairness', 'Pride', 'Camaraderie'];

const SEGMENT_COLORS = [
  'hsl(220 70% 55%)',
  'hsl(255 55% 58%)',
  'hsl(175 45% 45%)',
  'hsl(25 75% 55%)',
  'hsl(340 60% 55%)',
  'hsl(150 50% 45%)',
];

type ViewMode = 'performance' | 'gap';

interface InsightItem {
  segmentLabel: string;
  dimension: string;
  score: number;
  gap: number; // vs overall average for that dimension
  overallAvg: number;
}

interface TooltipEntry {
  name?: string;
  value?: number | string | null;
  color?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

export function DepartmentBreakdownChart({ data }: DepartmentBreakdownChartProps) {
  const t = useTranslations('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('performance');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  // Compute overall averages per dimension across all segments
  const overallAverages = useMemo(() => {
    const avgs: Record<string, number> = {};
    for (const dim of DIMENSION_ORDER) {
      const scores = data.segments
        .map((seg) => seg.dimensions.find((d) => d.dimension === dim)?.score)
        .filter((s): s is number => s !== null && s !== undefined);
      avgs[dim] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }
    return avgs;
  }, [data.segments]);

  // Build insights: top strengths & areas for improvement
  const { strengths, improvements } = useMemo(() => {
    const allItems: InsightItem[] = [];
    for (const seg of data.segments) {
      for (const d of seg.dimensions) {
        if (d.score === null) continue;
        const avg = overallAverages[d.dimension] ?? 0;
        allItems.push({
          segmentLabel: seg.segmentLabel,
          dimension: d.dimension,
          score: d.score,
          gap: d.score - avg,
          overallAvg: avg,
        });
      }
    }
    const sorted = [...allItems].sort((a, b) => b.gap - a.gap);
    return {
      strengths: sorted.slice(0, 3),
      improvements: sorted.slice(-3).reverse(),
    };
  }, [data.segments, overallAverages]);

  // Performance view: scores per segment for selected dimension (or highest-variance dimension)
  const activeDimension = selectedDimension ?? DIMENSION_ORDER[0];

  const performanceData = useMemo(() => {
    return data.segments
      .map((seg) => {
        const found = seg.dimensions.find((d) => d.dimension === activeDimension);
        const score = found?.score ?? null;
        const avg = overallAverages[activeDimension] ?? 0;
        return {
          name: seg.segmentLabel,
          score: score,
          gap: score !== null ? score - avg : null,
          responseCount: seg.responseCount,
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [data.segments, activeDimension, overallAverages]);

  // Gap analysis view: each segment's deviation from avg across all dimensions
  const gapData = useMemo(() => {
    return data.segments.map((seg) => {
      const entry: Record<string, string | number | null> = { name: seg.segmentLabel };
      for (const dim of DIMENSION_ORDER) {
        const found = seg.dimensions.find((d) => d.dimension === dim);
        const score = found?.score;
        if (score !== null && score !== undefined) {
          entry[dim] = score - (overallAverages[dim] ?? 0);
        } else {
          entry[dim] = null;
        }
      }
      return entry;
    });
  }, [data.segments, overallAverages]);

  function PerformanceTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const entry = payload[0];
    const score = entry.value as number | null;
    const gap = entry.payload?.gap as number | null;
    const avg = overallAverages[activeDimension] ?? 0;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-xs min-w-[160px]">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-semibold">{score !== null ? `${score}%` : t('insufficientData')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg:</span>
            <span className="text-muted-foreground">{avg}%</span>
          </div>
          {gap !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">vs Avg:</span>
              <span className={cn('font-semibold', gap >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {gap >= 0 ? '+' : ''}{gap}pp
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function GapTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-xs min-w-[160px]">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((entry, i) => {
          const val = entry.value as number | null;
          return (
            <div key={`${entry.name ?? ''}-${i}`} className="flex justify-between gap-3 py-0.5">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className={cn('font-semibold', (val ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                {val !== null ? `${(val ?? 0) >= 0 ? '+' : ''}${val}pp` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (data.segments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noDepartmentData')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle & Dimension Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex rounded-lg border bg-muted/30 p-0.5">
          <button
            onClick={() => setViewMode('performance')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              viewMode === 'performance'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Performance
          </button>
          <button
            onClick={() => setViewMode('gap')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              viewMode === 'gap'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Gap Analysis
          </button>
        </div>

        {viewMode === 'performance' && (
          <div className="flex flex-wrap gap-1.5">
            {DIMENSION_ORDER.map((dim) => (
              <button
                key={dim}
                onClick={() => setSelectedDimension(dim)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full transition-colors border',
                  activeDimension === dim
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                {dim}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Baseline Legend */}
      {viewMode === 'performance' && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-muted-foreground/70" />
            Baseline Avg: {overallAverages[activeDimension]}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(152 55% 48%)' }} />
            Above
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(35 80% 55%)' }} />
            Below
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(0 65% 55%)' }} />
            Critical
          </span>
        </div>
      )}

      {/* Chart */}
      {viewMode === 'performance' ? (
        <ResponsiveContainer width="100%" height={Math.max(200, data.segments.length * 48 + 40)}>
          <BarChart
            data={performanceData}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 8, left: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<PerformanceTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {performanceData.map((entry, index) => {
                const gap = entry.gap ?? 0;
                const color = gap >= 5
                  ? 'hsl(152 55% 48%)'  // strong above avg
                  : gap >= 0
                    ? 'hsl(152 35% 55%)' // slightly above
                    : gap >= -5
                      ? 'hsl(35 80% 55%)' // slightly below (amber)
                      : 'hsl(0 65% 55%)'; // significantly below (red)
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
            {/* Render after Bar so the line draws on top of bars */}
            <ReferenceLine
              x={overallAverages[activeDimension] ?? 0}
              stroke="hsl(0 0% 50%)"
              strokeDasharray="6 4"
              strokeWidth={1}
              ifOverflow="extendDomain"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.segments.length * 56 + 40)}>
          <BarChart
            data={gapData}
            layout="vertical"
            margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}pp`}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<GapTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            {DIMENSION_ORDER.map((dim, i) => (
              <Bar
                key={dim}
                dataKey={dim}
                fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                radius={[0, 3, 3, 0]}
                maxBarSize={14}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Top Strengths */}
        <div className="rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
          <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            Top Performers
          </h4>
          <div className="space-y-1.5">
            {strengths.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground/80 truncate mr-2">
                  {item.segmentLabel} · {item.dimension}
                </span>
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="font-semibold">{item.score}%</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                    +{item.gap}pp
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 p-3">
          <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
            Needs Attention
          </h4>
          <div className="space-y-1.5">
            {improvements.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground/80 truncate mr-2">
                  {item.segmentLabel} · {item.dimension}
                </span>
                <span className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="font-semibold">{item.score}%</span>
                  <span className="text-red-500 dark:text-red-400 text-[10px]">
                    {item.gap}pp
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
