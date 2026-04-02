'use client';

import { useTranslations } from 'next-intl';
import { MessageSquare, AlertTriangle, Lightbulb, Heart } from 'lucide-react';
import type { SentimentAnalysisData, OpenEndedSentiment } from '@/lib/types/analytics';
import { cn } from '@/lib/utils';

interface SentimentAnalysisCardsProps {
  data: SentimentAnalysisData;
}

interface SentimentCardProps {
  sentiment: OpenEndedSentiment;
}

function SentimentBadge({
  type,
  count,
  percentage,
  themes,
}: {
  type: 'frustrated' | 'constructive' | 'positive' | 'unclassified';
  count: number;
  percentage: number;
  themes?: string[];
}) {
  const t = useTranslations('dashboard');
  const config = {
    frustrated: {
      label: t('sentimentFrustrated'),
      icon: AlertTriangle,
      bg: 'hsl(0 55% 96%)',
      text: 'hsl(0 55% 40%)',
      bar: 'hsl(0 55% 58%)',
      badge: 'hsl(0 55% 92%)',
      border: 'hsl(0 40% 85%)',
    },
    constructive: {
      label: t('sentimentConstructive'),
      icon: Lightbulb,
      bg: 'hsl(35 80% 96%)',
      text: 'hsl(35 70% 35%)',
      bar: 'hsl(35 80% 55%)',
      badge: 'hsl(35 80% 90%)',
      border: 'hsl(35 60% 80%)',
    },
    positive: {
      label: t('sentimentPositive'),
      icon: Heart,
      bg: 'hsl(155 50% 96%)',
      text: 'hsl(155 50% 30%)',
      bar: 'hsl(155 50% 48%)',
      badge: 'hsl(155 50% 90%)',
      border: 'hsl(155 40% 80%)',
    },
    unclassified: {
      label: t('sentimentNeutralMixed'),
      icon: MessageSquare,
      bg: 'hsl(220 10% 96%)',
      text: 'hsl(220 10% 45%)',
      bar: 'hsl(220 10% 72%)',
      badge: 'hsl(220 10% 90%)',
      border: 'hsl(220 10% 85%)',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: c.bg }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: c.text }} />
          <span className="text-xs font-medium" style={{ color: c.text }}>{c.label}</span>
        </div>
        <span
          className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full"
          style={{ color: c.text, backgroundColor: c.badge }}
        >
          {count} ({percentage}%)
        </span>
      </div>
      {/* Mini progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${c.bar}33` }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: c.bar }}
        />
      </div>
      {/* Themes */}
      {themes && themes.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {themes.map(theme => (
            <span
              key={theme}
              className="inline-block text-[10px] px-1.5 py-0.5 rounded border"
              style={{ borderColor: c.border, color: c.text }}
            >
              {theme}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function OpenEndedCard({ sentiment }: SentimentCardProps) {
  const t = useTranslations('dashboard');
  if (sentiment.totalResponses === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">{sentiment.questionLabel}</p>
        <p className="text-xs text-muted-foreground italic">{t('noOpenEndedResponses')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground leading-relaxed">
          {sentiment.questionLabel}
        </p>
        <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
          {sentiment.totalResponses} {t('responses')}
        </span>
      </div>
      {/* Stacked bar — ordered: positive → constructive → neutral → frustrated */}
      <div className="flex h-2 rounded-full overflow-hidden">
        {sentiment.positive.percentage > 0 && (
          <div
            style={{ width: `${sentiment.positive.percentage}%`, backgroundColor: 'hsl(155 50% 48%)' }}
            className="h-full transition-all"
            title={`Positive: ${sentiment.positive.percentage}%`}
          />
        )}
        {sentiment.constructive.percentage > 0 && (
          <div
            style={{ width: `${sentiment.constructive.percentage}%`, backgroundColor: 'hsl(35 80% 55%)' }}
            className="h-full transition-all"
            title={`Constructive: ${sentiment.constructive.percentage}%`}
          />
        )}
        {sentiment.unclassified.percentage > 0 && (
          <div
            style={{ width: `${sentiment.unclassified.percentage}%`, backgroundColor: 'hsl(220 10% 82%)' }}
            className="h-full transition-all"
            title={`Neutral: ${sentiment.unclassified.percentage}%`}
          />
        )}
        {sentiment.frustrated.percentage > 0 && (
          <div
            style={{ width: `${sentiment.frustrated.percentage}%`, backgroundColor: 'hsl(0 55% 58%)' }}
            className="h-full transition-all"
            title={`Frustrated: ${sentiment.frustrated.percentage}%`}
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sentiment.frustrated.count > 0 && (
          <SentimentBadge
            type="frustrated"
            count={sentiment.frustrated.count}
            percentage={sentiment.frustrated.percentage}
            themes={sentiment.frustrated.themes}
          />
        )}
        {sentiment.constructive.count > 0 && (
          <SentimentBadge
            type="constructive"
            count={sentiment.constructive.count}
            percentage={sentiment.constructive.percentage}
            themes={sentiment.constructive.themes}
          />
        )}
        {sentiment.positive.count > 0 && (
          <SentimentBadge
            type="positive"
            count={sentiment.positive.count}
            percentage={sentiment.positive.percentage}
            themes={sentiment.positive.themes}
          />
        )}
        {sentiment.unclassified.count > 0 && (
          <SentimentBadge
            type="unclassified"
            count={sentiment.unclassified.count}
            percentage={sentiment.unclassified.percentage}
          />
        )}
      </div>
    </div>
  );
}

export function SentimentAnalysisCards({ data }: SentimentAnalysisCardsProps) {
  const t = useTranslations('dashboard');
  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          {t('sentimentQ1')}
        </h4>
        <OpenEndedCard sentiment={data.oe01} />
      </div>
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          {t('sentimentQ2')}
        </h4>
        <OpenEndedCard sentiment={data.oe02} />
      </div>
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
        {t('sentimentMethodology')}
      </p>
    </div>
  );
}
