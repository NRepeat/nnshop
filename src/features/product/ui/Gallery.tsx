import type {
  ProductVariant,
  Image as ShoipidyImage,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shared/ui/carousel';
import { Bookmark } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

const Gallery = ({
  images,
  selectedVariant,
}: {
  images: {
    node: Pick<ShoipidyImage, 'url' | 'altText' | 'width' | 'height'>;
  }[];
  selectedVariant: ProductVariant;
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
  const selectedVariantImageIndex = React.useMemo(() => {
    return images.findIndex(
      (image) =>
        image.node.url.split('?')[0] ===
        selectedVariant?.image?.url.split('?')[0],
    );
  }, [selectedVariant]);

  React.useEffect(() => {
    if (mainApi) {
      mainApi?.scrollTo(selectedVariantImageIndex, false);
    }
    setSelectedIndex(selectedVariantImageIndex);
  }, [mainApi, selectedVariantImageIndex, selectedVariant]);

  return (
    <div className="md:col-span-4">
      <div className="relative">
        <Carousel setApi={setMainApi}>
          <CarouselContent>
            {images.map((image: any, index: number) => (
              <CarouselItem key={index}>
                <div className="aspect-[1] relative flex items-center justify-center overflow-hidden max-h-[calc(100vh-16rem)]">
                  <Image
                    src={image.node.url}
                    alt={image.node.altText || ''}
                    width={image.node.width}
                    height={image.node.height}
                    className="h-auto w-auto max-h-full max-w-full"
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
                  className={
                    'aspect-square relative border rounded-none overflow-hidden ' +
                    (index === selectedIndex
                      ? 'border-primary'
                      : 'border-transparent opacity-50')
                  }
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
