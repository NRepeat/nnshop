import { Locale, locales } from '@/shared/i18n/routing';
import { getPage } from '@features/home/api/get-home-page';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(checkout)/checkout/[...slug]/loading';
import { HeroBanner } from '@entities/home/ui/hero-banner';
import { MainCollectionGrid } from '@entities/home/ui/main-collection-grid';
import { ProductCarousel } from '@entities/home/ui/product-carousel';
import { Topic } from '@entities/home/ui/topic';
import { StoriesCarousel } from '@entities/home/ui/stories-carousel';
import { SplitCollection } from '@entities/home/ui/split-collection';

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CurrentSession />
    </Suspense>
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
    return (
      <div className="flex flex-col ">
        <div className="flex flex-col">
          <HeroBanner />
          <MainCollectionGrid />
          <ProductCarousel />
          <SplitCollection />
          <Topic />
          <StoriesCarousel />
        </div>
      </div>
    );
  }
};
