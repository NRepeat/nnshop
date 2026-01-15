import { Features } from '@entities/feature';
import {
  HeroBanner,
  MainCollectionGrid,
  ProductCarousel,
} from '@entities/home/ui';
import { BrandGrid } from '@entities/home/ui/BrendGrid/BrendGrid';
import { PreviewsCollections } from '@entities/home/ui/previews-collections';
import { SplitImage } from '@entities/split-image';
import { HOME_PAGEResult } from '@shared/sanity/types';
type HeroPageProps = {
  content: NonNullable<HOME_PAGEResult>['content'];
  locale: string;
};

export const HeroPageBuilder = ({ content, locale }: HeroPageProps) => {
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
              <MainCollectionGrid key={block._key} locale={locale} {...block} />
            );
          case 'productCarousel':
            return (
              <ProductCarousel key={block._key} locale={locale} {...block} />
            );
          case 'splitImage':
            return <SplitImage key={block._key} locale={locale} {...block} />;
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
