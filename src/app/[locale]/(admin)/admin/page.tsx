// src/app/[locale]/(admin)/admin/page.tsx
import { getTranslations, getLocale } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';
import { cachedListSurveys, cachedComputeAnalytics, cachedMultiSurveyAnalytics, cachedGetDistinctDepartments } from '@/lib/cache';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ExportButtons } from '@/components/dashboard/ExportButtons';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ survey?: string; org?: string; dept?: string }>;
}) {
  const [t, { survey: surveyId, org, dept }, locale] = await Promise.all([
    getTranslations('dashboard'),
    searchParams,
    getLocale(),
  ]);

  const surveys = await cachedListSurveys();

  if (surveys.length === 0) {
    const checklist = [
      { label: t('step1'), done: false },
      { label: t('step2'), done: false },
      { label: t('step3'), done: false },
    ];

    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">
            {t('gettingStarted')}
          </h1>
          <p className="text-sm text-gray-400 mt-2">{t('gettingStartedDescription')}</p>
        </div>
        <div className="divider-dot mb-8" />
        <ol className="space-y-6">
          {checklist.map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="text-[11px] font-semibold text-gray-300 mt-0.5 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <span className={item.done ? 'text-gray-400 line-through text-sm' : 'text-gray-900 text-sm font-medium'}>
                  {item.label}
                </span>
                {item.done && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-2" />
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // Default to latest active survey (listSurveys returns ascending by createdAt)
  const activeSurveyId = surveyId
    ?? surveys.filter(s => s.status === 'active').at(-1)?.id
    ?? surveys.at(-1)?.id;

  // Load analytics + multi-survey data + departments in parallel
  const [analyticsData, multiSurveyData, departments] = await Promise.all([
    activeSurveyId ? cachedComputeAnalytics(activeSurveyId, org, dept, locale) : Promise.resolve(null),
    cachedMultiSurveyAnalytics(org, locale),
    activeSurveyId ? cachedGetDistinctDepartments(activeSurveyId) : Promise.resolve([]),
  ]);

  // Compute eesTrend from multi-survey delta
  let eesTrend = 0;
  if (analyticsData && activeSurveyId) {
    const currentIdx = multiSurveyData.surveys.findIndex(s => s.surveyId === activeSurveyId);
    if (currentIdx > 0) {
      eesTrend = analyticsData.eesScore - multiSurveyData.surveys[currentIdx - 1].eesScore;
    }
  }
  const analyticsWithTrend = analyticsData ? { ...analyticsData, eesTrend } : null;

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-2xl font-light text-gray-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-gray-400 mt-2">{t('subtitle')}</p>
      </div>
      <div className="mb-8 flex items-start justify-between gap-2 flex-wrap">
        <DashboardFilters surveys={surveys} activeSurveyId={activeSurveyId} deptOptions={departments} />
        {analyticsWithTrend && <ExportButtons data={analyticsWithTrend} />}
      </div>
      {analyticsWithTrend === null ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-light text-gray-900">{t('noResponsesTitle')}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t('noResponsesBody')}
          </p>
        </div>
      ) : (
        <DashboardCharts data={analyticsWithTrend} multiSurvey={multiSurveyData} />
      )}
    </div>
  );
}
