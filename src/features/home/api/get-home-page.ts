import { normalizeLocaleForSanity } from '@/shared/lib/locale';
import { sanityFetch } from '@/shared/sanity/lib/client';
import { HOME_PAGE } from '@/shared/sanity/lib/query';
import { Locale } from '@/shared/i18n/routing';

type RouteProps = {
  params: { locale: Locale; gender: string };
};

export const getHomePage = async (params: RouteProps['params']) => {
  const { locale } = params;
  const sanityLocale = await normalizeLocaleForSanity(locale);
  const page = await sanityFetch({
    query: HOME_PAGE,
    params: {
      language: sanityLocale,
      slug: params.gender,
    },
    tags: [params.gender, 'page'],
    revalidate: 60,
  });

  return page;
};
