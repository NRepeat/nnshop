'use client';
import type {
  Product,
  ProductVariant,
  Image as ShoipidyImage,
} from '@shared/lib/shopify/types/storefront.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shared/ui/carousel';
import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const Gallery = ({
  images,
  selectedVariant,
}: {
  images: {
    node: Pick<ShoipidyImage, 'url' | 'altText' | 'width' | 'height'>;
  }[];
  selectedVariant: ProductVariant;
}) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const onThumbClick = useCallback(
    (index: number) => {
      mainApi?.scrollTo(index);
      setSelectedIndex(index);
    },
    [mainApi],
  );

  const selectedVariantImageIndex = images.findIndex(
    (image) =>
      image.node.url.split('?')[0] ===
      selectedVariant?.image?.url.split('?')[0],
  );
  useEffect(() => {
    if (mainApi) {
      mainApi?.scrollTo(selectedVariantImageIndex, false);
    }
    setSelectedIndex(selectedVariantImageIndex);
  }, [mainApi, selectedVariantImageIndex]);

  return (
    <div className="md:col-span-3 ">
      <div className="relative">
        <Carousel setApi={setMainApi}>
          <CarouselContent>
            {images.map((image: any, index: number) => (
              <CarouselItem key={index}>
                <div className="aspect-[4/5] relative">
                  <Image
                    src={image.node.url}
                    alt={image.node.altText || ''}
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/50 backdrop-blur-sm"
          >
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {images.length > 1 && (
        <Carousel
          setApi={setThumbApi}
          opts={{ containScroll: 'keepSnaps', dragFree: true }}
          className="mt-4"
        >
          <CarouselContent className="pl-4">
            {images.map((image: any, index: number) => (
              <CarouselItem
                key={index}
                onClick={() => onThumbClick(index)}
                className="basis-1/4 cursor-pointer"
              >
                <div
                  className={cn(
                    'aspect-square relative border rounded-none overflow-hidden',
                    index === selectedIndex
                      ? 'border-primary'
                      : 'border-transparent opacity-50',
                  )}
                >
                  <Image
                    src={image.node.url}
                    alt={image.node.altText || ''}
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
  );
};

export default Gallery;
