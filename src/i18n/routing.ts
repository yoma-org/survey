// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'my'],
  defaultLocale: 'en',
  localeDetection: false,  // URL path only — no Accept-Language browser detection
});
