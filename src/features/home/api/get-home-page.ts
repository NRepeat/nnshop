import { normalizeLocaleForSanity } from '@/shared/lib/locale';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { HOME_PAGE } from '@/shared/sanity/lib/query';
import { Locale } from '@/shared/i18n/routing';

type RouteProps = {
  params: { locale: Locale; gender: string };
};

export const getHomePage = async (params: RouteProps['params']) => {
  'use cache';
  const { locale, gender } = params;
  const pagesSlug = {
    man: 'man-home',
    woman: 'woman-home',
  };
  const sanityLocale = await normalizeLocaleForSanity(locale);
  const page = await sanityFetch({
    query: HOME_PAGE,
    params: {
      language: sanityLocale,
      slug: pagesSlug[gender as keyof typeof pagesSlug],
    },
    revalidate: 60,
  });
  console.log(
    'sanityLocale',
    page,
    sanityLocale,
    pagesSlug[gender as keyof typeof pagesSlug],
  );

  // if (!page) throw new Error('Page not found');

  return page;
};
