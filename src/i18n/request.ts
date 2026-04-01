// src/i18n/request.ts — STUB created in 01-01 so next.config.ts resolves at build time
// Plan 01-03 overwrites this with the full getRequestConfig implementation
import { getRequestConfig } from 'next-intl/server';
export default getRequestConfig(async () => ({ locale: 'en', messages: {} }));
