'use client';
import { PAGE_QUERYResult } from '@/sanity/types';
import { FAQs } from './blocks/FAQs';
import { Features } from './blocks/Features';
import { Hero } from './blocks/hero';
import { SplitImage } from './blocks/SplitImage';
import { createDataAttribute } from 'next-sanity';
import { client as sanityClient } from '@/sanity/lib/client';
import { useOptimistic } from 'next-sanity/hooks';
import { notFound } from 'next/navigation';
import ProductCarousel from './blocks/ProductCarousel';
type PageBuilderProps = {
  content: NonNullable<PAGE_QUERYResult>['content'];
  documentId: string;
  documentType: string;
};

const { projectId, dataset, stega } = sanityClient.config();
export const createDataAttributeConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega.studioUrl === 'string' ? stega.studioUrl : '',
};

export function PageBuilder({
  content,
  documentId,
  documentType,
}: PageBuilderProps) {
  const blocks = useOptimistic<
    NonNullable<PAGE_QUERYResult>['content'] | undefined,
    NonNullable<PAGE_QUERYResult>
  >(content, (state, action) => {
    if (action.id === documentId) {
      return action?.document?.content?.map(
        (block) => state?.find((s) => s._key === block?._key) || block,
      );
    }
    return state;
  });

  if (!Array.isArray(blocks)) {
    return null;
  }

  return (
    <main
      data-sanity={createDataAttribute({
        ...createDataAttributeConfig,
        id: documentId,
        type: documentType,
        path: 'content',
      }).toString()}
      className="w-full flex justify-center"
    >
      {blocks.map((block) => {
        const DragHandle = ({ children }: { children: React.ReactNode }) => (
          <div
            data-sanity={createDataAttribute({
              ...createDataAttributeConfig,
              id: documentId,
              type: documentType,
              path: `content[_key=="${block._key}"]`,
            }).toString()}
          >
            {children}
          </div>
        );

        switch (block._type) {
          case 'hero':
            return (
              <DragHandle key={block._key}>
                <Hero {...block} />
              </DragHandle>
            );
          case 'features':
            return (
              <DragHandle key={block._key}>
                <Features {...block} />
              </DragHandle>
            );
          case 'splitImage':
            return (
              <DragHandle key={block._key}>
                <SplitImage {...block} />
              </DragHandle>
            );
          case 'faqs':
            return (
              <DragHandle key={block._key}>
                <FAQs {...block} />
              </DragHandle>
            );
          case 'productCarousel':
            return (
              <DragHandle key={block._key}>
                <ProductCarousel {...block} />
              </DragHandle>
            );
          default:
            // This is a fallback for when we don't have a block type
            return <>Something went wrong</>;
        }
      })}
    </main>
  );
}
