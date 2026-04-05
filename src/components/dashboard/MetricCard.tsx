'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CountUp } from '@/components/motion/CountUp';
import { getPerformanceZone } from '@/lib/performance-zones';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
  benchmark?: number;
  showZone?: boolean;
  testId?: string;
}

export function MetricCard({ label, value, suffix = '%', trend, benchmark, showZone = true, testId }: MetricCardProps) {
  const t = useTranslations('dashboard');
  const zone = showZone && suffix === '%' ? getPerformanceZone(value) : null;
  const gap = benchmark != null ? value - benchmark : null;

  return (
    <div className="space-y-0.5" {...(testId && { 'data-test-id': testId })}>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
          <CountUp value={value} suffix={suffix} />
        </span>
        <span className="text-xs text-muted-foreground leading-tight max-w-[90px]">
          {label}
        </span>
      </div>

      {/* Compact info line: zone + benchmark in one row */}
      {(zone || gap != null) && (
        <div className="flex items-center gap-2 text-[10px]">
          {zone && (
            <span style={{ color: zone.color }}>
              {t(zone.labelKey)}
            </span>
          )}
          {gap != null && (
            <span className={gap >= 0 ? 'text-green-600' : 'text-red-500'}>
              {gap > 0 ? '+' : ''}{gap} vs {benchmark}%
            </span>
          )}
        </div>
      )}

      {trend && trend.value !== 0 && (
        <div className={`flex items-center gap-1 text-[10px] ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
