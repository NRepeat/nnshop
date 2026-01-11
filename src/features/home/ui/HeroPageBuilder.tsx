import { HeroBanner, MainCollectionGrid } from '@entities/home/ui';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { notFound } from 'next/navigation';
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
          default:
            return null;
        }
      })}
    </main>
  );
};
