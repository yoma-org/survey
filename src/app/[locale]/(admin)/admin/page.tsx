// src/app/[locale]/(admin)/admin/page.tsx
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { listSurveys } from '@/lib/services/survey.service';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

export default async function AdminDashboardPage() {
  const t = await getTranslations('dashboard');
  const surveys = await listSurveys();
  const hasSurveys = surveys.length > 0;

  // Show onboarding if no surveys exist yet
  if (!hasSurveys) {
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

  // Dashboard with charts — surveys exist
  // TODO: Phase 4 will compute real analytics from responses CSV
  // For now, show the dashboard layout with demo data
  const demoData = {
    eesScore: 79,
    eesTrend: -4,
    gptwScore: 87,
    responseRate: 92,
    totalResponses: 276,
    dimensions: [
      { dimension: 'Credibility', score: 75 },
      { dimension: 'Respect', score: 75 },
      { dimension: 'Fairness', score: 78 },
      { dimension: 'Pride', score: 84 },
      { dimension: 'Camaraderie', score: 84 },
    ],
    sentiment: { positive: 79, neutral: 16, negative: 5 },
    enps: { score: 84, promoters: 86, passives: 12, detractors: 2 },
    strengths: [
      { label: 'People here are treated fairly regardless of their age', score: 95 },
      { label: 'This is a physically safe place to work', score: 94 },
      { label: 'I can be myself around here', score: 93 },
      { label: 'My colleagues care about me as a human being', score: 92 },
      { label: 'I\'m proud to tell others I work here', score: 91 },
      { label: 'I feel good about the ways we contribute', score: 90 },
      { label: 'I felt genuinely welcomed when I joined', score: 89 },
      { label: 'My work has special meaning', score: 89 },
      { label: 'I can count on colleagues to help me', score: 88 },
      { label: 'Our leaders embody our best characteristics', score: 87 },
    ],
    opportunities: [
      { label: 'I am offered training or development', score: 46 },
      { label: 'I receive the same support as my peers', score: 55 },
      { label: 'Company policies are enforced consistently', score: 58 },
      { label: 'I am compensated fairly for my work', score: 60 },
      { label: 'My workload is reasonable and distributed fairly', score: 62 },
      { label: 'I am kept in the loop on important changes', score: 63 },
      { label: 'I feel confident raising a concern', score: 65 },
      { label: 'Teams and resources are organized effectively', score: 66 },
      { label: 'I experience great collaboration across departments', score: 67 },
      { label: 'Everyone has opportunity for special recognition', score: 68 },
    ],
    leaderboard: [
      { label: 'Completion', value: 92, color: '#2563eb' },
      { label: 'Credibility', value: 75, color: '#2563eb' },
      { label: 'Respect', value: 75, color: '#7c3aed' },
      { label: 'Fairness', value: 78, color: '#0891b2' },
      { label: 'Pride', value: 84, color: '#ea580c' },
      { label: 'Camaraderie', value: 84, color: '#16a34a' },
      { label: 'Satisfaction', value: 87, color: '#2563eb' },
      { label: 'ENPS', value: 84, color: '#16a34a' },
      { label: 'Engagement', value: 80, color: '#7c3aed' },
      { label: 'Innovation', value: 72, color: '#0891b2' },
      { label: 'Leadership', value: 76, color: '#ea580c' },
    ],
  };

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-2xl font-light text-gray-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-gray-400 mt-2">{t('subtitle')}</p>
      </div>
      <DashboardCharts data={demoData} />
    </div>
  );
}
