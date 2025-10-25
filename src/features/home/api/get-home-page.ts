import { normalizeLocaleForSanity } from '@/shared/lib/locale';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { HOME_PAGE_QUERY } from '@/shared/sanity/lib/query';
import { HOME_PAGE_QUERYResult } from '@/shared/sanity/types';
import { Locale } from '@/shared/i18n/routing';

type RouteProps = {
  params: Promise<{ locale: Locale }>;
};

export const getPage = async (params: RouteProps['params']) => {
  const { locale } = await params;

  const sanityLocale = await normalizeLocaleForSanity(locale);

  const page = (await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { language: sanityLocale },
    revalidate: 3600,
  })) as HOME_PAGE_QUERYResult;
  return page;
};
