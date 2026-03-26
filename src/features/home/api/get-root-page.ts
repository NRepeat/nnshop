import { normalizeLocaleForSanity } from '@/shared/lib/locale';
import { sanityFetch } from '@/shared/sanity/lib/sanityFetch';
import { HOME_PAGE } from '@/shared/sanity/lib/query';
import { Locale } from '@/shared/i18n/routing';

export const getRootPage = async (locale: Locale) => {
  const sanityLocale = await normalizeLocaleForSanity(locale);
  return sanityFetch({
    query: HOME_PAGE,
    params: { language: sanityLocale, slug: 'home' },
    tags: ['homepage', 'home'],
  });
};
