// src/app/[locale]/(admin)/admin/surveys/[id]/invite/page.tsx
import { redirect } from 'next/navigation';
import { cachedGetSurvey, cachedListTokens } from '@/lib/cache';
import { EmailDistributionForm } from '@/components/admin/EmailDistributionForm';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const [survey, priorInvitations] = await Promise.all([
    cachedGetSurvey(id),
    cachedListTokens(id),
  ]);

  if (!survey) {
    redirect(`/${locale}/admin/surveys`);
  }

  return (
    <div className="p-8">
      <EmailDistributionForm
        survey={survey}
        priorInvitations={priorInvitations}
      />
    </div>
  );
}
