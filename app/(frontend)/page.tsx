import { Locale, locales } from '@/shared/i18n/routing';
import { getPage } from '@features/home/api/get-home-page';
import { PageBuilder } from '@widgets/page-builder';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(checkout)/checkout/[...slug]/loading';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <CurrentSession />
      </Suspense>
    </div>
  );
}

const CurrentSession = async () => {
  const locale = (await getLocale()) as Locale;
  const cookie = await cookies();
  const gender = cookie.get('gender')?.value || 'woman';
  return <PageContent locale={locale} gender={gender} />;
};

const PageContent = async ({
  locale,
  gender,
}: {
  locale: Locale;
  gender: string;
}) => {
  'use cache';
  // cacheLife({ stale: 60, expire: 60 });
  const page = await getPage({ locale, gender });
  if (page) {
    return null;
  }

  return (
    <PageBuilder
      content={page.content as any}
      documentId={page._id}
      documentType="page"
    />
  );
};
