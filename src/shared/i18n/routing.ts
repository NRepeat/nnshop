import { defineRouting } from 'next-intl/routing';
export type Locale = 'en' | 'uk';

export const locales = ['en', 'uk'];

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'uk',
});
