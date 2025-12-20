import { Locale, locales } from '@/shared/i18n/routing';
import { getPage } from '@features/home/api/get-home-page';
import { getLocale } from 'next-intl/server';
import { cacheLife } from 'next/cache';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
type RouteProps = {
  params: Promise<{ locale: Locale }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page({ params }: RouteProps) {
  return (
    <div>
      <Suspense>
        <CurrentSession />
      </Suspense>
    </div>
  );
}

const CurrentSession = async () => {
  const locale = (await getLocale()) as Locale;
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return (
    <>
      {gender}
      <PageContent locale={locale} />
    </>
  );
};

const PageContent = async ({ locale }: { locale: Locale }) => {
  'use cache';
  cacheLife({ stale: 60, expire: 60 });

  const page = await getPage({ locale });
  return <div>{page?.homePage?._id}</div>;
};
