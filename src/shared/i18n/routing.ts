import { defineRouting } from 'next-intl/routing';
import { GENDERS } from '@shared/config/shop';
export type Locale = 'uk' | 'ru';

export const locales = ['uk', 'ru'];

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'uk',
  localeDetection: false,
  alternateLinks: false,
});

export const genders: string[] = [...GENDERS];
