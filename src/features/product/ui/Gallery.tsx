'use client';
import 'photoswipe/dist/photoswipe.css';
import { useWindowSize } from "@uidotdev/usehooks";
import { Gallery as PhotoSwipeGallery, Item } from 'react-photoswipe-gallery';
import type {
  ProductVariant,
  Image as ShoipifyImage,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';
import { Bookmark, Heart } from 'lucide-react';

import { toggleFavoriteProduct } from '../api/toggle-favorite';
import { BookmarkFilledIcon, HeartFilledIcon } from '@sanity/icons';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@shared/lib/utils';

const Gallery = ({
  images,
  isFavorite,
  productId,
}: {
  images: ShoipifyImage[];
  productId: string;
  isFavorite?: boolean;
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

  const handleFavoriteToggle = async (id: string) => {
    try {
      await toggleFavoriteProduct(id);
    } catch (error) {
      console.error(error);
    }
  };
  const { width: windowWidth } = useWindowSize();
  const md = windowWidth && windowWidth >= 768;
  const lg = windowWidth && windowWidth >= 1024;
  console.log( md ? 3 : 5);
  return (
    <PhotoSwipeGallery>
      <div className="col-span-1 lg:col-span-2 gap-6 flex flex-col">
        <div className="relative">
          <Carousel setApi={setMainApi}>
            <CarouselContent className="[&>div]:-ml-0">
              {images.map((image, index: number) => (
                <CarouselItem key={index} className="cursor-zoom-in">
                  <Item
                    id={index}
                    original={image.url}
                    thumbnail={image.url}
                    width={image.width ?? 0}
                    height={image.height ?? 0}
                  >
                    {({ ref, open }) => (
                      <div className="flex shrink justify-center" ref={ref}>
                        <Image
                          src={image.url}
                          alt={image.altText || ''}
                          width={image.width || '400'}
                          height={image.height || '400'}
                          className="h-auto w-auto max-h-[55vh] max-w-full"
                          onClick={open}
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
          <div className="absolute -top-5 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await handleFavoriteToggle(productId);
              }}
              className="hover:[&>svg]:stroke-[#e31e24]"
            >
              {isFavorite ? (
                <HeartFilledIcon className="stroke-[#e31e24]" />
              ) : (
                <Heart />
              )}
            </Button>
          </div>
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
                      'aspect-square relative border rounded-none overflow-hidden ' +
                      (index === selectedIndex
                        ? 'border-primary'
                        : 'border-transparent opacity-50')
                    }
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || ''}
                      fill
                      className="object-cover "
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
                      index === selectedDotIndex ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                    onClick={() => onDotClick(index)}
                  />
                ))}
              </div>
            )}
          </Carousel>
        )}
      </div>
    </PhotoSwipeGallery>
  );
};

export default Gallery;
