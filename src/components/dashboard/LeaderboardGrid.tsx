'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
    <Card className="p-4 border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Leaderboard</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{metric.label}</span>
              <span className="text-xs font-semibold" style={{ color: metric.color }}>
                {metric.value}%
              </span>
            </div>
            <Progress value={metric.value} className="h-1.5" />
          </div>
        ))}
      </div>
    </Card>
  );
}
