'use client';
import 'photoswipe/dist/photoswipe.css';
import { useWindowSize } from '@uidotdev/usehooks';
import { Gallery as PhotoSwipeGallery, Item } from 'react-photoswipe-gallery';
import type { Image as ShoipifyImage } from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@shared/lib/utils';

const Gallery = ({
  images,
  children,
}: {
  images: ShoipifyImage[];
  productId: string;
  children?: React.ReactNode;
  handle: string;
}) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [secApi, setSecApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDotIndex, setSelectedDotIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const onInit = useCallback((api: CarouselApi) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
      setSelectedIndex(index);
      // onSelect(mainApi);
    },
    [mainApi],
  );
  const onDotClick = useCallback(
    (index: number) => {
      secApi?.scrollTo(index);
      setSelectedDotIndex(index);
    },
    [secApi],
  );
  const onSelect = useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      if (mainApi && secApi) {
        if (api === mainApi) {
          setSelectedIndex(mainApi.selectedScrollSnap());
          if (
            mainApi.selectedScrollSnap() === 1 &&
            secApi.selectedScrollSnap() === 1
          ) {
            secApi.scrollTo(0);
            setSelectedDotIndex(0);
          } else {
            secApi.scrollTo(mainApi.selectedScrollSnap());
            setSelectedDotIndex(secApi.selectedScrollSnap());
          }
        } else {
          const index = secApi.selectedScrollSnap();
          mainApi.scrollTo(index);
          setSelectedDotIndex(secApi.selectedScrollSnap());
        }
      }
    },
    [secApi, mainApi],
  );
  useEffect(() => {
    if (mainApi) {
      mainApi.on('select', onSelect);
    }
    if (secApi) {
      // secApi.on('select', onSelect);
      // secApi.on('reInit', onSelect);
      onInit(secApi);
    }

    return () => {
      if (mainApi) mainApi.off('select', onSelect);
      if (secApi) {
        secApi.off('select', onSelect);
        secApi.off('reInit', onSelect);
      }
    };
  }, [mainApi, secApi, onSelect, onInit]);

  const { width: windowWidth } = useWindowSize();
  const md = windowWidth && windowWidth >= 768;

  return (
    <PhotoSwipeGallery>
      <div className="col-span-1 lg:col-span-2 gap-6 flex flex-col  justify-center w-full items-center">
        <div className="max-w-[600px] w-full  flex flex-col gap-2">
          <div className="relative">
            <Carousel setApi={setMainApi}>
              <CarouselContent className="[&>div]:-ml-0 ">
                {images.map((image, index: number) => (
                  <CarouselItem key={index} className="cursor-zoom-in ">
                    <Item
                      id={index}
                      original={image.url}
                      thumbnail={image.url}
                      width={image.width ?? 0}
                      height={image.height ?? 0}
                    >
                      {({ ref, open }) => (
                        <div
                          className="relative w-full aspect-square flex items-center justify-center  "
                          ref={ref}
                        >
                          <Image
                            src={image.url}
                            alt={image.altText || ''}
                            fill
                            className="object-contain rounded-md"
                            onClick={open}
                            fetchPriority={index === 0 ? 'high' : 'auto'}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                          />
                        </div>
                      )}
                    </Item>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext
                variant={'ghost'}
                size={'icon'}
                className="group-hover:flex  bg-background/70 rounded-full top-1/2 right-2 absolute hidden md:flex"
              />
              <CarouselPrevious
                variant={'ghost'}
                className="group-hover:flex  bg-background/70 rounded-full top-1/2 left-2 absolute hidden md:flex"
              />
            </Carousel>
            <div className="absolute -top-5 right-2">{children}</div>
          </div>
          {images.length > 1 && (
            <Carousel
              opts={{
                // containScroll: 'keepSnaps',
                dragFree: true,
                slidesToScroll: !md ? 3 : 5,
              }}
              className=""
              setApi={setSecApi}
            >
              <CarouselContent
                className={cn(' [&>div]:ml-0 ', {
                  '[&>div]:justify-center': images.length < 3,
                })}
              >
                {[...images].map((image, index: number) => (
                  <CarouselItem
                    key={index}
                    onClick={() => onThumbClick(index)}
                    className="basis-1/3 md:basis-1/3 lg:basis-1/5 cursor-pointer"
                  >
                    <div
                      className={
                        'aspect-square relative border rounded-md overflow-hidden ' +
                        (index === selectedIndex
                          ? 'border-primary'
                          : 'border-transparent opacity-50')
                      }
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || ''}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/*<CarouselNext
              variant={'ghost'}
              size={'icon'}
              className="group-hover:flex  bg-background/70 rounded-full top-1/2 right-2 absolute hidden md:flex"
            />
            <CarouselPrevious
              variant={'ghost'}
              className="group-hover:flex  bg-background/70 rounded-full top-1/2 left-2 absolute hidden md:flex"
            />*/}
              {scrollSnaps.length > 2 && (
                <div className="flex justify-center gap-2 mt-4">
                  {scrollSnaps.map((_, index) => (
                    <Button
                      key={index}
                      disabled={images.length <= 1}
                      className={`w-2 h-2 p-1 px-3 rounded-full ${
                        index === selectedDotIndex
                          ? 'bg-gray-800'
                          : 'bg-gray-300'
                      }`}
                      onClick={() => onDotClick(index)}
                    />
                  ))}
                </div>
              )}
            </Carousel>
          )}
        </div>
      </div>
    </PhotoSwipeGallery>
  );
};

export default Gallery;
