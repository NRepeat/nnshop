import { Locale, locales } from '@/shared/i18n/routing';
import { getHomePage } from '@features/home/api/get-home-page';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Loading from './(checkout)/checkout/[...slug]/loading';
import { HeroBanner } from '@entities/home/ui/hero-banner';
import { MainCollectionGrid } from '@entities/home/ui/main-collection-grid';
import { ProductCarousel } from '@entities/home/ui/product-carousel';
import { Topic } from '@entities/home/ui/topic';
import { StoriesCarousel } from '@entities/home/ui/stories-carousel';
import { SplitCollection } from '@entities/home/ui/split-collection';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { notFound } from 'next/navigation';
import { cacheLife } from 'next/dist/server/use-cache/cache-life';

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
  const cookie = await cookies();
  const locale = cookie.get('locale')?.value as Locale;
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
  cacheLife('default');
  const page = await getHomePage({ locale, gender });
  console.log(page);
  type HeroPageProps = { content: NonNullable<HOME_PAGEResult>['content'] };

  const HeroPageBuilder = ({ content }: HeroPageProps) => {
    if (!Array.isArray(content)) {
      return null;
    }
    return (
      <main className="flex flex-col">
        {content.map((block) => {
          switch (block._type) {
            case 'heroSlider':
              return <HeroBanner key={block._key} {...block} />;
            case 'mainCollectionGrid':
              return <MainCollectionGrid key={block._key} {...block} />;
          }
        })}
      </main>
    );
  };
  if (!page) {
    return notFound();
  }
  return (
    <div className="flex flex-col">
      <HeroPageBuilder content={page.content} />
      <ProductCarousel />
      <SplitCollection />
      <Topic />
      <StoriesCarousel />
    </div>
  );
  // }
};
