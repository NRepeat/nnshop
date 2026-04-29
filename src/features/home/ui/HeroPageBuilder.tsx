import { PortableText } from 'next-sanity';
import { components as portableTextComponents } from '@shared/sanity/components/portableText';
import { Features } from '@entities/feature';
import {
  HeroBanner,
  MainCollectionGrid,
  ProductCarousel,
  MainCollectionGridSkeleton,
  PopularPosts,
  ProductCarouselSkeleton,
  PreviewsCollectionsSkeleton,
  CollectionBannerGrid,
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
import { Fragment, Suspense } from 'react';
import { HeroSwiper } from '@entities/slider/ui/Slider';
import type { PAGE_QUERYResult, SliderBlock } from '@shared/sanity/types';
import { AnnouncementTicker } from '@entities/announcement-bar/AnnouncementTicker';
import { HEADER_QUERY } from '@shared/sanity/lib/query';
import { sanityFetch } from '@shared/sanity/lib/sanityFetch';
import { FadeInView } from '@shared/ui/FadeInView';

type PageContent = NonNullable<
  NonNullable<PAGE_QUERYResult>['content']
>[number];
type CollectionsCarouselBlock = Extract<
  PageContent,
  { _type: 'collectionsCarousel' }
>;
type SharedSectionRefBlock = {
  _type: 'sharedSectionRef';
  _key: string;
  section?: { content?: PageContent[] };
};

type HeroPageProps = {
  locale: Locale;
  gender: string;
  /** Override the Sanity page slug to fetch. Defaults to `gender`. */
  slug?: string;
};

const renderBlock = (
  block: PageContent,
  locale: Locale,
  gender: string,
  isFirst: boolean = false,
  tickerText?: string,
): React.ReactNode => {
  if ((block as any)._type === 'collectionBannerGrid') {
    return (
      <CollectionBannerGrid
        key={(block as any)._key}
        locale={locale}
        gender={gender}
        {...(block as any)}
      />
    );
  }

  switch (block._type) {
    case 'heroSlider': {
      const hero = block as any;
      return (
        <Fragment key={block._key}>
          {tickerText && (
            <AnnouncementTicker
              text={tickerText}
              className="md:hidden bg-foreground text-background py-3 overflow-hidden border-y border-white/10"
            />
          )}
          <HeroBanner {...hero} gender={gender} locale={locale} isFirst={isFirst} />
        </Fragment>
      );
    }

    case 'mainCollectionGrid':
      return (
        <Suspense
          key={block._key}
          fallback={<MainCollectionGridSkeleton />}
        >
          <MainCollectionGrid
            locale={locale}
            gender={gender}
            {...(block as any)}
          />
        </Suspense>
      );

    case 'productCarousel':
      return (
        <Suspense key={block._key} fallback={<ProductCarouselSkeleton />}>
          <ProductCarousel
            locale={locale}
            gender={gender}
            {...(block as any)}
          />
        </Suspense>
      );

    case 'splitImage':
      return (
        <Suspense key={block._key} fallback={<SplitImageSkeleton />}>
          <SplitImage locale={locale} gender={gender} {...(block as any)} />
        </Suspense>
      );

    case 'features':
      return <Features key={block._key} locale={locale} {...(block as any)} />;

    case 'brandGridBlock':
      return <BrandGrid key={block._key} locale={locale} gender={gender} {...(block as any)} />;

    case 'collectionsWithPreviews':
      return (
        <Suspense key={block._key} fallback={<PreviewsCollectionsSkeleton />}>
          <PreviewsCollections
            locale={locale}
            gender={gender}
            {...(block as any)}
          />
        </Suspense>
      );

    case 'hero':
      return (
        <Fragment key={block._key}>
          {tickerText && (
            <AnnouncementTicker
              text={tickerText}
              className="md:hidden bg-foreground text-background py-3 overflow-hidden border-y border-white/10"
            />
          )}
          <Hero {...(block as any)} isFirst={isFirst} />
        </Fragment>
      );

    case 'faqs':
      return <FAQs key={block._key} locale={locale} {...(block as any)} />;

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
      return (
        <section key={block._key} className="container py-8">
          <div className="prose max-w-none">
            {block.body && <PortableText value={block.body as any} components={portableTextComponents} />}
          </div>
        </section>
      );

    case 'productDetails':
      // Product details is typically used on product pages
      return null;

    case 'sharedSectionRef': {
      const sharedContent = (block as unknown as SharedSectionRefBlock).section?.content;
      if (!Array.isArray(sharedContent)) return null;
      return (
        <Fragment key={(block as unknown as SharedSectionRefBlock)._key}>
          {sharedContent.map((innerBlock, index) => renderBlock(innerBlock, locale, gender, isFirst && index === 0, tickerText))}
        </Fragment>
      );
    }

    default:
      console.warn(
        `Unknown block type: ${(block as { _type: string })._type}`,
      );
      return null;
  }
};

export const HeroPageBuilder = async ({ gender, locale, slug }: HeroPageProps) => {
  const [page, headerData] = await Promise.all([
    getHomePage({ locale, gender: slug ?? gender }),
    sanityFetch({
      query: HEADER_QUERY,
      params: { locale },
      tags: ['siteSettings'],
    }),
  ]);

  if (!page) {
    return notFound();
  }

  const { content } = page;
  if (!Array.isArray(content)) {
    return null;
  }

  const rawTickerText = headerData?.infoBar?.text;
  const tickerText = typeof rawTickerText === 'string' ? rawTickerText : undefined;

  return (
    <div className="flex flex-col">
      {(content as PageContent[]).map((block, index) => {
        const node = renderBlock(block, locale, gender, index === 0, tickerText);
        if (!node) return null;
        // First block (hero) renders without animation for instant LCP
        if (index === 0) return node;
        return (
          <FadeInView key={(block as any)._key || index}>
            {node}
          </FadeInView>
        );
      })}
    </div>
  );
};
