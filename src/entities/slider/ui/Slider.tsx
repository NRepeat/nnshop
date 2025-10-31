import { Carousel, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
import { PAGE_QUERYResult } from '@/shared/sanity/types';
import Image from 'next/image';
import Link from 'next/link';

type HeroSwiperProps = Extract<
  NonNullable<NonNullable<PAGE_QUERYResult>['content']>[number],
  { _type: 'sliderBlock' }
> & {
  documentId: string;
  documentType: string;
  blockIndex: number;
};
export function HeroSwiper({
  slides,
  documentId,
  documentType,
  blockIndex,
  _type,
}: HeroSwiperProps) {
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
            <CarouselItem key={slide._key || index}>
              <div className="relative w-full overflow-hidden">
                <Link
                  //@ts-expect-error sanity
                  href={slide?.link ? '/' + slide?.link[0].reference.slug : '/'}
                >
                  <Image
                    //@ts-expect-error sanity
                    src={slide.backgroundImage?.asset.url}
                    alt={'asd'}
                    width={1920}
                    height={1080}
                    priority
                  />
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
}
