'use client';

import { resolveLink } from '@/features/blocks/split-image/lib/resolveLink';
import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';import { useLocale } from 'next-intl';
import { getLocalizedString } from '@shared/sanity/utils/getLocalizedString';

type HeroSwiperProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'sliderBlock' }
> & {
  documentId: string;
  documentType: string;
  blockIndex: number;
};
export function HeroSwiper({ slides }: HeroSwiperProps) {
  if (!slides || slides.length === 0) return null;
  const locale = useLocale();

  return (
    <Carousel
      className="w-full "
      autoplay={{ active: true, dellay: 3500 }}
      opts={{ loop: true }}
    >
      <CarouselContent className="-ml-1 ">
        {slides.map((slide, index) => (
          <CarouselItem key={slide._key || index}>
            <div className="relative w-full overflow-hidden  ">
              <Link
                //@ts-expect-error sanity
                href={resolveLink(slide.link) || '/'}
                className="flex justify-center "
              >
                <Image
                  //@ts-expect-error sanity
                  src={slide.backgroundImage?.asset.url}
                  className="min-h-[250px] object-cover md:min-h-fit md:object-contain"
                  alt={
                    getLocalizedString(slide.title, locale) || 'Slider Image'
                  }
                  width={1920}
                  height={1280}
                  priority
                />
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
