import { getPerformanceZone } from '@/lib/performance-zones';

interface LeaderboardMetric {
  label: string;
  value: number;
  color: string;
}

interface LeaderboardGridProps {
  metrics: LeaderboardMetric[];
}

export function LeaderboardGrid({ metrics }: LeaderboardGridProps) {
  return (
    <div className="py-4 border-y border-border" role="list" aria-label="Performance metrics">
      <div className="flex flex-wrap gap-x-8 gap-y-2 px-2 space-between">
        {metrics.map((metric) => {
          const zone = getPerformanceZone(metric.value);
          return (
            <div
              key={metric.label}
              role="listitem"
              className="flex items-baseline gap-1.5 whitespace-nowrap"
            >
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: zone.color }}
              >
                {metric.value}%
              </span>
              <span className="text-[11px] text-muted-foreground min-w-[30px] lg:min-w-[60px]">{metric.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
