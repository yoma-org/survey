// src/app/[locale]/(admin)/admin/settings/page.tsx
import { getTranslations } from 'next-intl/server';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { getAppSettings } from '@/lib/services/app-settings.service';
import { SMTPSettingsForm } from '@/components/admin/SMTPSettingsForm';
import { GeminiSettingsForm } from '@/components/admin/GeminiSettingsForm';
import type { SmtpSettings } from '@/lib/types';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const [smtpSettings, appSettings] = await Promise.all([
    getSmtpSettings(),
    getAppSettings(),
  ]);

  // Strip password before passing to client (password is write-only)
  const initialSettings: Omit<SmtpSettings, 'password'> | null = smtpSettings
    ? {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.username,
        fromAddress: smtpSettings.fromAddress,
        fromName: smtpSettings.fromName,
      }
    : null;

  // Mask API key for client
  const maskedGeminiKey = appSettings?.geminiApiKey ? '••••••••' : '';

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('smtpTitle')}</h2>
        <p className="text-sm text-gray-500 mb-6">{t('smtpDescription')}</p>
        <SMTPSettingsForm initialSettings={initialSettings} />
      </div>

      <div className="divider-dot my-10" />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('geminiTitle')}</h2>
        <p className="text-sm text-gray-500 mb-6">{t('geminiDescription')}</p>
        <GeminiSettingsForm initialApiKey={maskedGeminiKey} />
      </div>
    </div>
  );
}
