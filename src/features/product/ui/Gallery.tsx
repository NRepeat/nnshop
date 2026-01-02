'use client';
import 'photoswipe/dist/photoswipe.css';

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
} from '@shared/ui/carousel';
import { Bookmark } from 'lucide-react';

import * as React from 'react';
import { toggleFavoriteProduct } from '../api/toggle-favorite';
import { BookmarkFilledIcon } from '@sanity/icons';
import Image from 'next/image';

const Gallery = ({
  images,
  isFavorite,
  productId,
}: {
  images: ShoipifyImage[];
  selectedVariant: ProductVariant;
  productId: string;
  isFavorite?: boolean;
}) => {
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const onThumbClick = React.useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
      setSelectedIndex(index);
    },
    [mainApi],
  );

  const handleFavoriteToggle = async (id: string) => {
    try {
      await toggleFavoriteProduct(id);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <PhotoSwipeGallery>
      <div className="md:col-span-1">
        <div className="relative">
          <Carousel setApi={setMainApi}>
            <CarouselContent>
              {images.map((image, index: number) => (
                <CarouselItem key={index} className="">
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
          </Carousel>
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await handleFavoriteToggle(productId);
              }}
              className="rounded-full bg-white/50 backdrop-blur-sm"
            >
              {isFavorite ? (
                <BookmarkFilledIcon className="min-h-6 min-w-8" />
              ) : (
                <Bookmark className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        {images.length > 1 && (
          <Carousel
            opts={{ containScroll: 'keepSnaps', dragFree: true }}
            className="mt-4"
          >
            <CarouselContent className="pl-4">
              {images.map((image, index: number) => (
                <CarouselItem
                  key={index}
                  onClick={() => onThumbClick(index)}
                  className="basis-1/4 cursor-pointer"
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
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </PhotoSwipeGallery>
  );
};

export default Gallery;
