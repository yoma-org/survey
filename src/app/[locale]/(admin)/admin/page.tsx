// src/app/[locale]/(admin)/admin/page.tsx
import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const t = await getTranslations('dashboard');

  // Phase 1: static onboarding checklist (no data yet)
  const checklist = [
    { label: t('step1'), done: false },
    { label: t('step2'), done: false },
    { label: t('step3'), done: false },
  ];

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t('gettingStarted')}</CardTitle>
          <CardDescription>{t('gettingStartedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* onboarding checklist — static for Phase 1 */}
          <ol className="space-y-3">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={
                    item.done ? 'text-gray-400 line-through text-sm' : 'text-gray-700 text-sm'
                  }
                >
                  {i + 1}. {item.label}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
