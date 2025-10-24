import { defineRouting } from 'next-intl/routing';
export type Locale = 'en' | 'ua';

export const locales = ['en', 'ua'];

export const routing = defineRouting({
  locales: locales,

  defaultLocale: 'en',
});
