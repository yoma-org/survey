'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SurveySelectorProps {
  surveys: { id: string; name: string }[];
  activeSurveyId: string | undefined;
}

/**
 * Inner component that uses useSearchParams — wrapped in Suspense at export boundary
 * to allow prerendering of parent components. (Next.js requirement for useSearchParams)
 */
function SurveySelectorInner({ surveys, activeSurveyId }: SurveySelectorProps) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (surveys.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('noSurveysYet')}</p>;
  }

  function handleChange(surveyId: string | null) {
    if (!surveyId) return;
    // Preserve locale prefix (/en/admin or /my/admin) and any existing params
    const params = new URLSearchParams(searchParams.toString());
    params.set('survey', surveyId);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={activeSurveyId ?? ''} onValueChange={handleChange}>
      <SelectTrigger className="w-64">
        <span className="truncate">
          {surveys.find(s => s.id === activeSurveyId)?.name || t('selectSurvey')}
        </span>
      </SelectTrigger>
      <SelectContent>
        {surveys.map(s => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * SurveySelector — client component for switching between surveys via URL ?survey= param.
 * Wrapped in Suspense boundary so parent server components can be prerendered.
 */
export function SurveySelector(props: SurveySelectorProps) {
  return (
    <Suspense fallback={<div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />}>
      <SurveySelectorInner {...props} />
    </Suspense>
  );
}
