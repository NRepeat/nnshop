import { PAGE_QUERYResult } from '@shared/sanity/types';
import { ProductDetails } from '@entities/product/ui/ProductDetails';
import { ElegantEase } from '@entities/product/ui/ElegantEase';
import ProductComments from '@entities/product/ui/ProductComments';
import { HeroBanner } from '@entities/home/ui/hero-banner';
import { MainCollectionGrid } from '@entities/home/ui/main-collection-grid';
import { Hero } from '@entities/hero/ui/Hero';
import { SplitImage } from '@entities/split-image/ui/SplitImage';
import { Features } from '@entities/feature/ui/Feature';
import { FAQs } from '@entities/faq/ui/FAQ';
import ProductCarousel from '@entities/product/ui/ProductCarousel';
import SimilarProducts from '@entities/product/ui/SimilarProducts';
import CollectionCarousel from '@entities/collection/ui/CollectionCarousel';
import { HeroSwiper } from '@entities/slider/ui/Slider';
import { PortableText } from 'next-sanity';
import { components } from '@shared/sanity/components/portableText';
import { getLocale } from 'next-intl/server';

const blockComponents = {
  productDetails: (props: any) => <ProductDetails {...props} />,
  elegantEase: (props: any) => <ElegantEase {...props} />,
  productComments: (props: any) => <ProductComments {...props} />,
  heroSlider: (props: any) => <HeroBanner {...props} />,
  mainCollectionGrid: (props: any) => <MainCollectionGrid {...props} />,
  hero: (props: any) => <Hero {...props} />,
  splitImage: (props: any) => <SplitImage {...props} />,
  features: (props: any) => <Features {...props} />,
  faqs: (props: any) => <FAQs {...props} />,
  productCarousel: (props: any) => <ProductCarousel {...props} />,
  similarProducts: (props: any) => <SimilarProducts {...props} />,
  collectionsCarousel: (props: any) => <CollectionCarousel {...props} />,
  sliderBlock: (props: any) => <HeroSwiper {...props} />,
};

type Props = {
  content: NonNullable<PAGE_QUERYResult>['content'];
};

export const PageBuilder = async ({ content }: Props) => {
  // Made async
  if (!content) {
    return null;
  }
  const locale = await getLocale(); // Get current locale

  return (
    <>
      {content.map((block) => {
        if (block._type === 'contentPageBlock') {
          // Handle ContentPageBlock specifically
          const localizedBody =
            block.body && (block.body.en || block.body.uk)
              ? locale === 'uk'
                ? block.body.uk
                : block.body.en
              : null;
          return localizedBody ? (
            <PortableText
              key={block._key}
              value={localizedBody}
              components={components}
            />
          ) : null;
        }

        const Component = blockComponents[block._type];
        if (!Component) {
          return <div key={block._key}>Unknown block type: {block._type}</div>;
        }
        return <Component key={block._key} {...block} />;
      })}
    </>
  );
};
