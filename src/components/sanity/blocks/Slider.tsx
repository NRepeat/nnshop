'use client';

import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
import { Locale } from '@/shared/i18n/routing';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import autoplay from 'embla-carousel-autoplay';
import { useLocale } from 'next-intl';
import Image from 'next/image';

type HeroSwiperProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'sliderBlock' }
>;
export function HeroSwiper({ slides, title }: HeroSwiperProps) {
  const locale = useLocale() as Locale;
  if (!slides || slides.length === 0) return null;
  return (
    <Carousel plugins={[autoplay({ delay: 5000 })]}>
      <div className="">
        <CarouselContent className="pl-1  flex-row">
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full overflow-hidden">
                <Image
                  //@ts-expect-error sanity
                  src={slide.backgroundImage?.asset.url}
                  alt={'asd'}
                  width={1920}
                  height={1080}
                  priority
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
    </Carousel>
  );
}
