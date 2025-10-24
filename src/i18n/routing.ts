import { defineRouting } from 'next-intl/routing';
export type Locale = 'en' | 'ua';
export const routing = defineRouting({
  locales: ['en', 'ua'],

  defaultLocale: 'en',
});
