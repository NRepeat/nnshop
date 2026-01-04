'use client';
import Image from 'next/image';
import { Button } from '@shared/ui/button';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import { urlFor } from '@shared/sanity/lib/image';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
// import AutoScroll from 'embla-carousel-auto-scroll';

type HeroSliderProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'heroSlider' }
>;

export const HeroBanner = (props: HeroSliderProps) => {
  const { slides } = props;

  return (
    <div className="hero-banner relative">
      <Carousel
        opts={{ loop: true, active: true }}
        plugins={[
          Autoplay({
            active: true,
            playOnInit: true,
            delay: 8000,
          }),
        ]}
      >
        <CarouselContent>
          {slides?.map((slide, index) => (
            <CarouselItem key={index}>
              <Link href={slide && slide.link?.url ? slide.link?.url : '/'}>
                <div className="flex justify-center items-center">
                  {slide.image?.asset && (
                    <Image
                      src={urlFor(slide.image?.asset).url()}
                      alt=""
                      className=" object-cover w-full max-h-[598px] md:max-h-[70vh]"
                      width={375}
                      height={598}
                    />
                  )}
                  <div className="absolute bottom-16 left-[32px] w-fit flex flex-col gap-5">
                    {slide.description && (
                      <p className="text-white text-xl  font-sans font-400 md:text-3xl">
                        {slide.description}
                      </p>
                    )}
                    {slide.link && (
                      <Button
                        className="w-[120px] md:w-[220px]"
                        variant={'secondary'}
                      >
                        Shop now
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
