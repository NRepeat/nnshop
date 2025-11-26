import { PAGE_QUERYResult } from '@/shared/sanity/types';
import { ProductCarousel, SimilarProducts } from '@entities/product';
import { CollectionsCarousel } from '@entities/collection';
import { HeroSwiper } from '@entities/slider';
import { Hero } from '@/entities/hero';
import { Features } from '@/entities/feature';
import { SplitImage } from '@/entities/split-image';
import { FAQs } from '@/entities/faq';
import { createDataAttribute } from 'next-sanity';
import { createDataAttributeConfig } from '../lib/createDataAttributeConfig';

type PageBuilderProps = {
  content: NonNullable<PAGE_QUERYResult>['content'];
  documentId: string;
  documentType: string;
};

export function PageBuilder({
  content,
  documentId,
  documentType,
}: PageBuilderProps) {
  const blockComponents = {
    hero: Hero,
    features: Features,
    splitImage: SplitImage,
    faqs: FAQs,
    productCarousel: ProductCarousel,
    similarProducts: SimilarProducts,
    collectionsCarousel: CollectionsCarousel,
    sliderBlock: HeroSwiper,
  };

  return (
    <main className="w-full flex justify-center flex-col space-y-6 pt-4">
      {content?.map((block, index) => {
        const Component =
          blockComponents[block._type as keyof typeof blockComponents];
        const dataAttribute = createDataAttribute({
          ...createDataAttributeConfig,
          id: documentId,
          type: documentType,
          path: ['content'],
        }).toString();

        if (!Component) {
          return null;
        }

        return (
          <div key={block._key} data-sanity={dataAttribute}>
            <Component
              {...block}
              /*@ts-expect-error sanity*/
              documentId={documentId}
              /*@ts-expect-error sanity*/
              documentType={documentType}
              /*@ts-expect-error sanity*/
              blockIndex={index}
            />
          </div>
        );
      })}
    </main>
  );
}
