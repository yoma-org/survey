'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CountUp } from '@/components/motion/CountUp';
import { getPerformanceZone } from '@/lib/performance-zones';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
  benchmark?: number;   // industry benchmark to compare against
  showZone?: boolean;    // show performance zone badge
}

export function MetricCard({ label, value, suffix = '%', trend, benchmark, showZone = true }: MetricCardProps) {
  const zone = showZone && suffix === '%' ? getPerformanceZone(value) : null;
  const gap = benchmark != null ? value - benchmark : null;

  return (
    <div className="space-y-1.5">
      {/* Zone badge */}
      {zone && (
        <span
          className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded"
          style={{ color: zone.color, backgroundColor: zone.bgColor }}
        >
          {zone.label}
        </span>
      )}

      {/* Value + label */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
          <CountUp value={value} suffix={suffix} />
        </span>
        <span className="text-xs text-muted-foreground leading-tight max-w-[90px]">
          {label}
        </span>
      </div>

      {/* Benchmark comparison */}
      {gap != null && (
        <div className={`flex items-center gap-1 text-[11px] ${gap >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {gap > 0 ? <TrendingUp className="w-3 h-3" /> : gap < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{gap > 0 ? '+' : ''}{gap}pts vs benchmark ({benchmark}%)</span>
        </div>
      )}

      {/* Year-over-year trend */}
      {trend && trend.value !== 0 && (
        <div className={`flex items-center gap-1 text-[11px] ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
