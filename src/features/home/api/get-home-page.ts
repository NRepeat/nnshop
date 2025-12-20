import { normalizeLocaleForSanity } from '@/shared/lib/locale';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { HOME_PAGE_QUERY } from '@/shared/sanity/lib/query';
import { HOME_PAGE_QUERYResult } from '@/shared/sanity/types';
import { Locale } from '@/shared/i18n/routing';

type RouteProps = {
  params: { locale: Locale; gender: string };
};

export const getPage = async (params: RouteProps['params']) => {
  'use cache';
  const { locale, gender } = params;

  const sanityLocale = await normalizeLocaleForSanity(locale);

  const page = (await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { language: sanityLocale },
    tags: ['siteSettings'],
  })) as HOME_PAGE_QUERYResult;
  console.log(page);
  if (!page) throw new Error('Page not found');
  if (gender === 'man') {
    return page.homePageMan;
  }
  return page.homePageWoman;
};
