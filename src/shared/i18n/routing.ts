import { defineRouting } from 'next-intl/routing';
export type Locale = 'ru' | 'uk';

export const locales = ['ru', 'uk'];

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'uk',
});

export const genders:string[] = ['man', 'woman'];
