// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Language switcher — top-right corner, visible on all pages */}
      <div className="fixed top-3 right-3 z-50">
        <LanguageSwitcher />
      </div>
      {children}
    </NextIntlClientProvider>
  );
}
