'use client';

import { useTranslations } from 'next-intl';
import type { PillarHeatmapData } from '@/lib/types/analytics';
import { cn } from '@/lib/utils';

interface PillarHeatmapProps {
  data: PillarHeatmapData;
}

function getDeltaColor(delta: number | null): string {
  if (delta === null) return 'bg-muted/40 text-muted-foreground/50';
  if (delta >= 10) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  if (delta >= 3) return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400';
  if (delta >= -3) return 'bg-muted/30 text-foreground/70';
  if (delta >= -10) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
  return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400';
}

export function PillarHeatmap({ data }: PillarHeatmapProps) {
  const t = useTranslations('dashboard');
  if (data.departments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {t('noDepartmentData')}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-xs border-collapse"
        role="grid"
        aria-label="Pillar scores by department heatmap"
      >
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">
              {t('heatmapDepartment')}
            </th>
            {data.pillars.map(pillar => (
              <th
                key={pillar}
                className="text-center py-2 px-3 font-medium text-muted-foreground whitespace-nowrap"
              >
                {pillar}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Overall row */}
          <tr className="border-t border-border/50">
            <td className="py-2 pr-4 font-semibold text-foreground text-[11px] whitespace-nowrap">
              {t('overallAverage')}
            </td>
            {data.pillars.map(pillar => (
              <td key={pillar} className="py-2 px-3 text-center">
                <span className="inline-block rounded px-2 py-0.5 bg-muted/50 font-semibold tabular-nums">
                  {data.overallAverages[pillar] ?? '—'}%
                </span>
              </td>
            ))}
          </tr>
          {/* Department rows */}
          {data.departments.map((dept, i) => (
            <tr
              key={dept}
              className={cn(
                'border-t border-border/30',
                i % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
              )}
            >
              <td className="py-2 pr-4 text-foreground/80 whitespace-nowrap truncate max-w-[140px]" title={dept}>
                {dept}
              </td>
              {data.pillars.map(pillar => {
                const cell = data.cells.find(
                  c => c.department === dept && c.pillar === pillar
                );
                return (
                  <td key={pillar} className="py-1.5 px-2 text-center">
                    {cell?.score === null || cell?.score === undefined ? (
                      <span
                        className="inline-block rounded px-2 py-0.5 text-muted-foreground/40 text-[10px]"
                        title={t('heatmapInsufficient')}
                      >
                        —
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'inline-block rounded px-2 py-0.5 font-medium tabular-nums transition-colors',
                          getDeltaColor(cell?.delta ?? null)
                        )}
                        title={cell?.delta !== null ? `${cell.delta > 0 ? '+' : ''}${cell.delta}% vs overall` : undefined}
                      >
                        {cell.score}%
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-[10px] text-muted-foreground">
        <span className="font-medium">{t('heatmapColorLegend')}</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-950" />
          {t('heatmapAbove10')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-50 dark:bg-green-950" />
          {t('heatmapAbove3')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-muted/30" />
          {t('heatmapWithin3')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-50 dark:bg-amber-950" />
          {t('heatmapBelow3')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-50 dark:bg-red-950" />
          {t('heatmapBelow10')}
        </span>
      </div>
    </div>
  );
}
