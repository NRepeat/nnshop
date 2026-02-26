import { Features } from '@entities/feature';
import {
  HeroBanner,
  MainCollectionGrid,
  ProductCarousel,
  MainCollectionGridSkeleton,
  PopularPosts,
} from '@entities/home/ui';
import { BrandGrid } from '@entities/home/ui/BrendGrid/BrendGrid';
import { PreviewsCollections } from '@entities/home/ui/previews-collections';
import { SplitImage } from '@entities/split-image';
import { SplitImageSkeleton } from '@entities/split-image/ui/SplitImageSkeleton';
import { Hero } from '@entities/hero/ui/Hero';
import { FAQs } from '@entities/faq/ui/FAQ';
import SimilarProducts from '@entities/product/ui/SimilarProducts';
import CollectionsCarousel from '@entities/collection/ui/CollectionCarousel';
import { ElegantEase } from '@entities/product/ui/ElegantEase';
import ProductComments from '@entities/product/ui/ProductComments';
import { notFound } from 'next/navigation';
import { getHomePage } from '../api/get-home-page';
import { Locale } from '@/shared/i18n/routing';
import { Suspense } from 'react';
import { HeroSwiper } from '@entities/slider/ui/Slider';
import type { PAGE_QUERYResult, SliderBlock } from '@shared/sanity/types';

type PageContent = NonNullable<
  NonNullable<PAGE_QUERYResult>['content']
>[number];
type SimilarProductsBlock = Extract<PageContent, { _type: 'similarProducts' }>;
type CollectionsCarouselBlock = Extract<
  PageContent,
  { _type: 'collectionsCarousel' }
>;

type HeroPageProps = {
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
              <Suspense
                key={block._key}
                fallback={<MainCollectionGridSkeleton />}
              >
                <MainCollectionGrid
                  locale={locale}
                  gender={gender}
                  {...block}
                />
              </Suspense>
            );

          case 'productCarousel':
            return (
              <ProductCarousel
                key={block._key}
                locale={locale}
                gender={gender}
                {...block}
              />
            );

          case 'splitImage':
            return (
              <Suspense key={block._key} fallback={<SplitImageSkeleton />}>
                <SplitImage locale={locale} gender={gender} {...block} />
              </Suspense>
            );

          case 'features':
            return <Features key={block._key} locale={locale} {...block} />;

          // case 'brandGridBlock':
          //   return <BrandGrid key={block._key} locale={locale} gender={gender} {...block} />;

          case 'collectionsWithPreviews':
            return (
              <PreviewsCollections
                key={block._key}
                locale={locale}
                gender={gender}
                {...block}
              />
            );

          case 'hero':
            return <Hero key={block._key} {...block} />;

          case 'faqs':
            return <FAQs key={block._key} {...block} />;

          case 'similarProducts':
            return block.collection ? (
              <Suspense
                key={block._key}
                fallback={<div className="h-96 animate-pulse bg-gray-100" />}
              >
                <SimilarProducts
                  collection={
                    block.collection as unknown as Parameters<
                      typeof SimilarProducts
                    >[0]['collection']
                  }
                />
              </Suspense>
            ) : null;

          case 'collectionsCarousel': {
            const carousel = block as unknown as CollectionsCarouselBlock;
            return (
              <CollectionsCarousel
                key={block._key}
                collections={carousel.collections}
                title={carousel.title}
                action_text={carousel.action_text}
                gender={gender}
              />
            );
          }

          case 'sliderBlock':
            return (
              <HeroSwiper
                key={block._key}
                slides={(block as unknown as SliderBlock).slides}
              />
            );

          case 'elegantEase':
            return <ElegantEase key={block._key} />;

          case 'popularPosts':
            return (
              <PopularPosts
                key={block._key}
                {...(block as Parameters<typeof PopularPosts>[0])}
              />
            );

          case 'productComments':
            return <ProductComments key={block._key} />;

          case 'contentPageBlock':
            // Content page block - render portable text
            return (
              <section key={block._key} className="container py-8">
                <div className="prose max-w-none">
                  {/* Portable text content would be rendered here */}
                </div>
              </section>
            );

          case 'productDetails':
            // Product details is typically used on product pages
            return null;

          default:
            console.warn(
              `Unknown block type: ${(block as { _type: string })._type}`,
            );
            return null;
        }
      })}
    </main>
  );
};
