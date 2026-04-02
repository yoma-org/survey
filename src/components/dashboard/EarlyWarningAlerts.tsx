'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { EarlyWarningAlert } from '@/lib/types/analytics';

interface EarlyWarningAlertsProps {
  alerts: EarlyWarningAlert[];
}

export function EarlyWarningAlerts({ alerts }: EarlyWarningAlertsProps) {
  const t = useTranslations('dashboard');
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 text-base">✓</span>
        </div>
        <p className="text-sm font-medium text-foreground/80">{t('noEarlyWarnings')}</p>
        <p className="text-xs text-muted-foreground max-w-[280px]">
          {t('noEarlyWarningsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
            {t('dualAxisRiskCount', { count: alerts.length })}
          </p>
          <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
            {t('dualAxisRiskDesc')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.department}
            className="rounded-lg border border-border/60 bg-card px-4 py-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{alert.department}</span>
              <span className="text-[11px] text-muted-foreground">
                {alert.responseCount} {t('responses')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Their Job */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t('theirJob')}</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      {alert.jobScore}%
                    </span>
                    <span className="text-muted-foreground/60">
                      (avg {alert.overallJobAvg}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400/70"
                    style={{ width: `${alert.jobScore}%` }}
                  />
                </div>
                <div
                  className="h-px bg-border/60"
                  style={{ marginLeft: `${alert.overallJobAvg}%`, width: '2px', backgroundColor: 'hsl(var(--muted-foreground))', opacity: 0.4 }}
                />
              </div>

              {/* Credibility */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{t('credibility')}</span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                      {alert.credibilityScore}%
                    </span>
                    <span className="text-muted-foreground/60">
                      (avg {alert.overallCredibilityAvg}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400/70"
                    style={{ width: `${alert.credibilityScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Combined gap */}
            <div className="text-[10px] text-muted-foreground/70 border-t border-border/30 pt-2">
              {t('combinedGapLabel')}{' '}
              <span className="text-red-500 font-medium">
                {(alert.overallJobAvg - alert.jobScore) + (alert.overallCredibilityAvg - alert.credibilityScore)}pp
              </span>{' '}
              {t('belowBothDimensions')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
