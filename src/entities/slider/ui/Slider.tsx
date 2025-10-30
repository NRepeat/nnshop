import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

type HeroSwiperProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'sliderBlock' }
>;
export function HeroSwiper({ slides, title }: HeroSwiperProps) {
  if (!slides || slides.length === 0) return null;
  return (
    <>
      <Carousel
        className="w-full"
        autoplay={{ active: true, dellay: 3500 }}
        opts={{ loop: true }}
      >
        <CarouselContent className="-ml-1 ">
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
      </Carousel>
    </>
  );
}
