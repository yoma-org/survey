// src/app/[locale]/(admin)/admin/surveys/[id]/invite/page.tsx
import { redirect } from 'next/navigation';
import { getSurvey, listSurveys } from '@/lib/services/survey.service';
import { listTokens } from '@/lib/services/token.service';
import { EmailDistributionForm } from '@/components/admin/EmailDistributionForm';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const [survey, surveys, priorInvitations] = await Promise.all([
    getSurvey(id),
    listSurveys(),
    listTokens(id),
  ]);

  if (!survey) {
    redirect(`/${locale}/admin/surveys`);
  }

  return (
    <div className="p-8">
      <EmailDistributionForm
        survey={survey}
        surveys={surveys}
        priorInvitations={priorInvitations}
      />
    </div>
  );
}
