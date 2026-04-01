'use client';

import { CountUp } from '@/components/motion/CountUp';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
}

export function MetricCard({ label, value, suffix = '%', trend }: MetricCardProps) {
  return (
    <div className="space-y-2">
      <div className="metric-display text-gray-900">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="metric-label">{label}</div>
      {trend && (
        <div className={`text-xs ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </div>
      )}
    </div>
  );
}
