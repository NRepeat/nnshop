'use client';

import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shared/ui/carousel';
import { urlFor } from '@shared/sanity/lib/image';
import { HOME_PAGEResult } from '@shared/sanity/types';
import { useCallback, useEffect, useRef, useState } from 'react';

type HeroSliderProps = Extract<
  NonNullable<NonNullable<HOME_PAGEResult>['content']>[number],
  { _type: 'heroSlider' }
> & { gender?: string };

type Slide = NonNullable<HeroSliderProps['slides']>[number];

export const HeroBanner = (props: HeroSliderProps) => {
  const { slides, gender } = props;

  if (!slides || slides.length === 0) return null;

  const resolveHref = (
    url?: string | null,
    collection?: { handle?: string | null } | null,
  ) => {
    if (url) return url;
    if (collection?.handle) {
      return gender
        ? `/${gender}/${collection.handle}`
        : `/${collection.handle}`;
    }
    return null;
  };

  const getSlideHref = (slide: Slide) =>
    resolveHref(slide.link?.url, slide.collection) ?? '/';


  const renderImages = (slide: Slide, index: number) => (
    <>
      {slide.mobileImage?.asset && (
        <Image
          src={urlFor(slide.mobileImage.asset).url()}
          alt={slide.description || 'Banner mobile'}
          width={600}
          height={900}
          priority={index === 0}
          className="block md:hidden object-cover w-full max-h-[60vh]"
        />
      )}
      {slide.image?.asset && (
        <Image
          src={urlFor(slide.image.asset, 2560, 1040).url()}
          alt={slide.description || 'Banner desktop'}
          width={2560}
          height={1040}
          priority={index === 0}
          className={`${slide.mobileImage?.asset ? 'hidden md:block' : 'block'} w-full max-h-[75vh] object-cover`}
        />
      )}
    </>
  );

  const renderOverlay = (slide: Slide, hasButtons: boolean) => (
    <>
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
      <div className="absolute bottom-12 left-6 md:bottom-20 md:left-16 z-10 max-w-[80%] flex flex-col gap-6">
        {slide.description && (
          <h2 className="text-white text-3xl md:text-4xl lg:text-4xl font-medium tracking-tight drop-shadow-lg">
            {slide.description}
          </h2>
        )}
        {hasButtons && slide.buttons && slide.buttons.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {slide.buttons.map((btn) => (
              <Button
                variant={btn.variant ?? 'secondary'}
                className="min-w-[140px] h-11 md:h-13 text-sm uppercase tracking-widest rounded"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
  const [api2, setApi2] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const onInit = useCallback((api: CarouselApi) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);
  const onSelect = useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      if (api2) {
        if (api === api2) {
          api2.scrollTo(api2.selectedScrollSnap());
          setSelectedIndex(api2.selectedScrollSnap());
        }
      }
    },
    [api2],
  );
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (api2) {
      api2.on('select', onSelect);
      api2.on('reInit', onSelect);
      initTimerRef.current = setTimeout(() => onInit(api2), 0);
    }

    return () => {
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
      if (api2) {
        api2.off('select', onSelect);
        api2.off('reInit', onSelect);
      }
    };
  }, [api2, onSelect, onInit]);
  return (
    <div className="hero-banner relative w-full overflow-hidden 3xl:max-w-400">
      <Carousel
        opts={{ loop: true, active: true }}
        setApi={setApi2}
        plugins={[
          Autoplay({
            delay: 8000,
            stopOnInteraction: false,
          }),
        ]}
      >
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => {
            const hasButtons = !!slide.buttons?.length;
            return (
              <CarouselItem
                key={index}
                className="pl-0 relative w-full text-pretty font-light leading-tight tracking-tight text-left text-2xl md:text-4xl"
              >
                {hasButtons ? (
                  <Link
                    prefetch
                    href={getSlideHref(slide)}
                    className="group relative flex w-full h-full justify-center"
                  >
                    {renderImages(slide, index)}
                    {renderOverlay(slide, true)}
                  </Link>
                ) : (
                  /* No buttons — entire slide is clickable */
                  <Link
                    prefetch
                    href={getSlideHref(slide)}
                    className="group relative flex w-full h-full justify-center"
                  >
                    {renderImages(slide, index)}
                    {renderOverlay(slide, false)}
                  </Link>
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="flex justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <Button
              key={index}
              className={`w-2 h-[3px]  py-0 px-3  ${
                index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              onClick={() => api2?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};
