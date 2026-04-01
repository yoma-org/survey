// src/app/[locale]/(admin)/admin/surveys/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function SurveysPage() {
  const t = await getTranslations('surveys');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="text-gray-500 mt-1">{t('comingSoon')}</p>
    </div>
  );
}
