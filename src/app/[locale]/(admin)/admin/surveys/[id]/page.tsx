// src/app/[locale]/(admin)/admin/surveys/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getSurvey, getQuestions, getResponseCount } from '@/lib/services/survey.service';
import { generateToken } from '@/lib/services/token.service';
import { SurveyDetailClient } from '@/components/admin/SurveyDetailClient';

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const survey = await getSurvey(id);
  if (!survey) notFound();

  const [questions, responseCount, previewToken] = await Promise.all([
    getQuestions(id),
    getResponseCount(id),
    generateToken(id, 'admin-preview@survey-yoma.local'),
  ]);

  return (
    <SurveyDetailClient
      survey={survey}
      questions={questions}
      responseCount={responseCount}
      previewToken={previewToken}
    />
  );
}
