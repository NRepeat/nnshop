import { Features } from '@entities/feature';
import {
  HeroBanner,
  MainCollectionGrid,
  ProductCarousel,
  MainCollectionGridSkeleton,
} from '@entities/home/ui';
import { BrandGrid } from '@entities/home/ui/BrendGrid/BrendGrid';
import { PreviewsCollections } from '@entities/home/ui/previews-collections';
import { SplitImage } from '@entities/split-image';
import { SplitImageSkeleton } from '@entities/split-image/ui/SplitImageSkeleton'; // Corrected import
import { notFound } from 'next/navigation';
import { getHomePage } from '../api/get-home-page';
import { Locale } from '@/shared/i18n/routing';
import { Suspense } from 'react';
type HeroPageProps = {
  // content: NonNullable<HOME_PAGEResult>['content'];
  locale: Locale;
  gender: string;
};

export const HeroPageBuilder = async ({ gender, locale }: HeroPageProps) => {
  const page = await getHomePage({ locale, gender });
  if (!page) {
    return notFound();
  }
  const { content } = page;
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
            return (
              <Suspense key={block._key} fallback={<MainCollectionGridSkeleton />}>
                <MainCollectionGrid locale={locale} {...block} />
              </Suspense>
            );
          case 'productCarousel':
            return (
              <ProductCarousel key={block._key} locale={locale} {...block} />
            );
          case 'splitImage':
            return (
              <Suspense key={block._key} fallback={<SplitImageSkeleton />}>
                <SplitImage locale={locale} {...block} />
              </Suspense>
            );
          case 'features':
            return <Features key={block._key} locale={locale} {...block} />;
          case 'brandGridBlock':
            return <BrandGrid key={block._key} locale={locale} {...block} />;
          case 'collectionsWithPreviews':
            return (
              <PreviewsCollections
                key={block._key}
                locale={locale}
                {...block}
              />
            );
          default:
            return null;
        }
      })}
    </main>
  );
};
