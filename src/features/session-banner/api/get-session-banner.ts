import { normalizeLocaleForSanity } from '@shared/lib/locale';
import { sanityFetch } from '@shared/sanity/lib/client';
import { PROMOTION_BANNER_QUERY } from '@shared/sanity/lib/query';
import { Locale } from '@shared/i18n/routing';

export async function getSessionBanner(locale: Locale) {
  const language = await normalizeLocaleForSanity(locale);
  return sanityFetch({
    query: PROMOTION_BANNER_QUERY,
    params: { language },
    tags: ['promotionBanner'],
    revalidate: 300,
  });
}
