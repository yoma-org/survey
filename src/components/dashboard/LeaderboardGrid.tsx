'use client';

import { getPerformanceZone } from '@/lib/performance-zones';
import { FadeIn } from '@/components/motion/FadeIn';

interface LeaderboardMetric {
  label: string;
  value: number;
  color: string;
}

interface LeaderboardGridProps {
  metrics: LeaderboardMetric[];
}

export function LeaderboardGrid({ metrics }: LeaderboardGridProps) {
  // Sort by value ascending so the weakest areas are most visible
  const sorted = [...metrics].sort((a, b) => a.value - b.value);

  return (
    <FadeIn delay={0.1}>
      <div className="py-4 border-y border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">
            Performance Overview
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            sorted by score (lowest first)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3" role="list" aria-label="Performance metrics">
          {sorted.map((metric) => {
            const zone = getPerformanceZone(metric.value);
            return (
              <div key={metric.label} className="flex items-center gap-2" role="listitem">
                {/* Zone indicator dot */}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: zone.color }}>
                      {metric.value}%
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">{metric.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
