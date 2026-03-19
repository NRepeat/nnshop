import { Locale } from '@shared/i18n/routing';
import { getSessionBanner } from '../api/get-session-banner';
import { urlFor } from '@shared/sanity/lib/image';
import { SessionBannerClient } from './SessionBannerClient';

export async function SessionBanner({ locale }: { locale: string }) {
  const data = await getSessionBanner(locale as Locale);
  if (!data) return null;

  const imageUrl = data.image
    ? urlFor(data.image).width(600).auto('format').quality(80).url()
    : null;

  return <SessionBannerClient data={{ ...data, imageUrl }} />;
}
