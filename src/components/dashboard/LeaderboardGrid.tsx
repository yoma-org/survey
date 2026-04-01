'use client';

import { StaggerChildren, StaggerItem } from '@/components/motion/StaggerChildren';
import { CountUp } from '@/components/motion/CountUp';

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
    <div>
      <div className="divider-dot mb-8" />
      <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8" staggerDelay={0.06}>
        {metrics.map((metric) => (
          <StaggerItem key={metric.label}>
            <div className="space-y-1">
              <div className="text-2xl font-light tracking-tight text-gray-900 tabular-nums">
                <CountUp value={metric.value} duration={0.8} />
              </div>
              <div className="metric-label">{metric.label}</div>
              {/* Thin color indicator line */}
              <div className="w-8 h-0.5 rounded-full mt-2" style={{ backgroundColor: metric.color }} />
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>
    </div>
  );
}
