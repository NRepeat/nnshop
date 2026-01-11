import { Locale, locales } from '@/shared/i18n/routing';
import { getHomePage } from '@features/home/api/get-home-page';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(checkout)/checkout/[...slug]/loading';
import { PageContent } from '@widgets/home/ui/view';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page({
  params,
}: {
  params: { locale: Promise<{ locale: Locale }> };
}) {
  const { locale } = await params.locale;
  return (
    <Suspense fallback={<Loading />}>
      <CurrentSession locale={locale} />
    </Suspense>
  );
}

const CurrentSession = async ({ locale }: { locale: Locale }) => {
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <PageContent locale={locale} gender={gender} />;
};
