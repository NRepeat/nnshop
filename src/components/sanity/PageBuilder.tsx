import { PAGE_QUERYResult } from '@/sanity/types';
import { FAQs } from './blocks/FAQs';
import { Features } from './blocks/Features';
import { Hero } from './blocks/hero';
import { SplitImage } from './blocks/SplitImage';
import { notFound } from 'next/navigation';

type PageBuilderProps = {
  content: NonNullable<PAGE_QUERYResult>['content'];
};

export function PageBuilder({ content }: PageBuilderProps) {
  if (!Array.isArray(content)) {
    return null;
  }
  console.log('content', content);
  return (
    <main>
      {content.map((block) => {
        switch (block._type) {
          case 'hero':
            return <Hero key={block._key} {...block} />;
          case 'features':
            return <Features key={block._key} {...block} />;
          case 'splitImage':
            return <SplitImage key={block._key} {...block} />;
          case 'faqs':
            return <FAQs key={block._key} {...block} />;
          default:
            return notFound();
        }
      })}
    </main>
  );
}
