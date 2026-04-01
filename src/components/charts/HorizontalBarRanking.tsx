'use client';

import { getPerformanceZone } from '@/lib/performance-zones';

interface RankingItem {
  label: string;
  score: number;
}

interface HorizontalBarRankingProps {
  items: RankingItem[];
  baseHue?: number;
  mode?: 'strengths' | 'opportunities';
}

export function HorizontalBarRanking({ items, baseHue = 155, mode = 'strengths' }: HorizontalBarRankingProps) {
  const max = Math.max(...items.map((i) => i.score), 100);

  return (
    <div
      role="img"
      aria-label={`Ranking: ${items.map(i => `${i.label} ${i.score}%`).join(', ')}`}
      className="space-y-1"
    >
      {items.map((item, i) => {
        const zone = getPerformanceZone(item.score);
        const isOpportunity = mode === 'opportunities';

        return (
          <div key={item.label} className="group flex items-center gap-3 py-1.5">
            {/* Rank */}
            <span className="text-[11px] tabular-nums text-muted-foreground/40 w-4 text-right shrink-0">
              {i + 1}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-[12px] text-foreground/80 truncate pr-2" title={item.label}>
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Score with zone color */}
                  <span className="text-[12px] font-semibold tabular-nums" style={{ color: zone.color }}>
                    {item.score}%
                  </span>
                  {/* Zone micro-badge for opportunities */}
                  {isOpportunity && (
                    <span
                      className="text-[9px] font-medium px-1 py-0.5 rounded"
                      style={{ color: zone.color, backgroundColor: zone.bgColor }}
                    >
                      {zone.label}
                    </span>
                  )}
                </div>
              </div>
              {/* Bar */}
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(item.score / max) * 100}%`,
                    backgroundColor: zone.color,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
