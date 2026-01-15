'use client';

import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@shared/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@shared/ui/carousel';
import { urlFor } from '@shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';

type HeroSliderProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'heroSlider' }
>;

export const HeroBanner = (props: HeroSliderProps) => {
  const { slides } = props;

  if (!slides || slides.length === 0) return null;

  return (
    <div className="hero-banner relative w-full overflow-hidden mx-auto 3xl:max-w-400">
      <Carousel
        opts={{ loop: true, active: true }}
        plugins={[
          Autoplay({
            delay: 8000,
            stopOnInteraction: false,
          }),
        ]}
      >
        <CarouselContent className="ml-0 ">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="pl-0 relative w-full ">
              <Link
                href={slide?.link?.url ?? '/'}
                className="group relative flex w-full h-full justify-center"
              >
                {slide.image?.asset && (
                  <>
                    {/*<div className="block md:hidden  relative w-full h-full">
                      <Image
                        src={urlFor(slide.image.asset, 600, 700).url()}
                        alt={slide.description || 'Banner mobile'}
                        width={600}
                        height={900}
                        priority={index === 0}
                        className="object-cover max-h-[500px]"
                      />
                    </div>

                    <div className="hidden md:block relative w-full h-full">
                      <Image
                        src={urlFor(slide.image.asset, 1320, 535).url()}
                        alt={slide.description || 'Banner desktop'}
                        width={1320}
                        height={535}
                        priority={index === 0}
                        className="object-cover"
                      />
                    </div>*/}
                    {/*<div className="hidden lg:block relative w-full h-full">*/}
                    <Image
                      src={urlFor(slide.image.asset, 2560, 1040).url()}
                      alt={slide.description || 'Banner desktop'}
                      width={2560}
                      height={1040}
                      priority={index === 0}
                      className="object-cover h-[350px] md:h-[530px] lg:h-[560px]"
                    />
                    {/*</div>*/}
                  </>
                )}

                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />

                <div className="absolute bottom-12 left-6 md:bottom-20 md:left-16 z-10 max-w-[80%] flex flex-col gap-6">
                  {slide.description && (
                    <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight drop-shadow-lg">
                      {slide.description}
                    </h2>
                  )}

                  {slide.link && (
                    <Button
                      variant="secondary"
                      className="w-fit min-w-[160px] h-12 md:h-14 text-sm md:text-base uppercase tracking-widest transition-transform group-hover:scale-105"
                    >
                      Shop now
                    </Button>
                  )}
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
