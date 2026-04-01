// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await requestLocale (Next.js 15+ async params)
  let locale = await requestLocale;

  // Validate locale — fall back to default if invalid
  if (!locale || !routing.locales.includes(locale as 'en' | 'my')) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
