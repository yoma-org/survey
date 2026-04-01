'use client';

import { Card } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: { value: number; label: string };
  color?: string;
}

export function MetricCard({ label, value, suffix = '%', trend, color = '#2563eb' }: MetricCardProps) {
  return (
    <Card className="p-4 border-gray-100">
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-semibold" style={{ color }}>{value}</span>
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
      {trend && (
        <div className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </Card>
  );
}
