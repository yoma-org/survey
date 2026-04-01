// src/app/[locale]/(admin)/admin/settings/page.tsx
import { getTranslations } from 'next-intl/server';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { SMTPSettingsForm } from '@/components/admin/SMTPSettingsForm';
import type { SmtpSettings } from '@/lib/types';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const settings = await getSmtpSettings();

  // Strip password before passing to client (password is write-only)
  const initialSettings: Omit<SmtpSettings, 'password'> | null = settings
    ? {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        fromAddress: settings.fromAddress,
        fromName: settings.fromName,
      }
    : null;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('smtpTitle')}</h2>
        <p className="text-sm text-gray-500 mb-6">{t('smtpDescription')}</p>
        <SMTPSettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  );
}
