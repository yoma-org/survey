// Server Component — token validation and data loading
// Public route — NOT behind admin auth guard
import { notFound } from 'next/navigation';
import { findTokenByValue } from '@/lib/services/token.service';
import { getSurvey, getQuestions, getDepartments } from '@/lib/services/survey.service';
import { SurveyForm } from '@/components/survey/SurveyForm';
import { AlertCircle } from 'lucide-react';

// Load both locales' survey translations for the client-side language switcher
import { readFileSync } from 'fs';
import { join } from 'path';

function getSurveyTranslations() {
  const en = JSON.parse(readFileSync(join(process.cwd(), 'messages/en.json'), 'utf-8'));
  const my = JSON.parse(readFileSync(join(process.cwd(), 'messages/my.json'), 'utf-8'));
  return { en: en.survey, my: my.survey };
}

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;

  const tokenRow = await findTokenByValue(token);

  // Token not found → 404
  if (!tokenRow) {
    notFound();
  }

  // ACCEPTED DEVIATION: CONTEXT.md locked "410 Gone" for used tokens.
  // Next.js App Router page.tsx cannot set HTTP status codes — only route handlers can.
  // The API at POST /api/surveys/[id]/submit returns 410 as locked. This page returns HTTP 200
  // but renders the identical friendly error UI. Behaviour is indistinguishable to the end user.
  if (tokenRow.status === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Survey already submitted</h1>
          <p className="text-sm text-gray-500">
            This survey link has already been used. Each link can only be used once. Please contact your administrator if you need assistance.
          </p>
        </div>
      </div>
    );
  }

  const [survey, questions, surveyTranslations, departments] = await Promise.all([
    getSurvey(tokenRow.surveyId),
    getQuestions(tokenRow.surveyId),
    getSurveyTranslations(),
    getDepartments(),
  ]);

  if (!survey) {
    notFound();
  }

  return (
    <SurveyForm
      survey={survey}
      questions={questions}
      tokenRow={tokenRow}
      locale={locale as 'en' | 'my'}
      translations={surveyTranslations}
      departments={departments}
    />
  );
}
