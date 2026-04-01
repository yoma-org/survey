// src/app/[locale]/(admin)/admin/surveys/[id]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSurvey, getQuestions, getResponseCount } from '@/lib/services/survey.service';
import { Badge } from '@/components/ui/badge';
import type { Survey, Question } from '@/lib/types';

function StatusBadge({ status, t }: { status: Survey['status']; t: (key: string) => string }) {
  if (status === 'active') {
    return <Badge className="bg-blue-50 text-blue-700 border-0">{t('statusActive')}</Badge>;
  }
  if (status === 'closed') {
    return <Badge variant="outline">{t('statusClosed')}</Badge>;
  }
  return <Badge variant="secondary">{t('statusDraft')}</Badge>;
}

function TypeBadge({ type }: { type: Question['type'] }) {
  if (type === 'likert') return <Badge className="bg-blue-50 text-blue-700 border-0">Likert</Badge>;
  if (type === 'open_ended') return <Badge variant="secondary">Open-ended</Badge>;
  return <Badge variant="outline">Demographic</Badge>;
}

export default async function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('surveys');

  const survey = await getSurvey(id);
  if (!survey) notFound();

  const [questions, responseCount] = await Promise.all([
    getQuestions(id),
    getResponseCount(id),
  ]);

  return (
    <div className="p-6">
      {/* Back link */}
      <Link
        href="../surveys"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1"
      >
        ← Back to Surveys
      </Link>

      {/* Survey header */}
      <div className="mt-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[20px] font-semibold text-gray-900">{survey.name}</h1>
          <StatusBadge status={survey.status} t={t} />
        </div>
        {survey.description && (
          <p className="text-sm text-muted-foreground">{survey.description}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>{t('questionCount', { count: questions.length })}</span>
          <span>{t('responseCount', { count: responseCount })}</span>
          <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <Link
          href={`../surveys/${id}/invite`}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Send Invitations
        </Link>
      </div>

      {/* Question table */}
      {questions.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionId')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionEnglish')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionBurmese')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionType')}</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">{t('questionSection')}</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs">{q.id}</td>
                  <td className="px-3 py-2 max-w-[240px]">{q.en}</td>
                  <td className="px-3 py-2 max-w-[240px]">{q.my}</td>
                  <td className="px-3 py-2">
                    <TypeBadge type={q.type} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">{q.dimension ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center text-muted-foreground text-sm">
          No questions imported yet.
        </div>
      )}
    </div>
  );
}
