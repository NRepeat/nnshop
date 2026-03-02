'use client';

import { urlFor } from '@shared/sanity/lib/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@shared/ui/carousel';
import { GetCollectionQuery } from '@shared/lib/shopify/types/storefront.generated';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { ProductCard } from '@entities/product/ui/ProductCard';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { stripGenderFromHandle } from '@features/header/navigation/utils/strip-gender-from-handle';

type Preview = {
  _key: string;
  _type: 'preview';
  asset?: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
  handle?: {
    current?: string;
  };
};

type SyncedCarouselsProps = {
  collectionsData: (
    | {
        collection: GetCollectionQuery;
        alternateHandle: string;
      }
    | undefined
  )[];
  previews: Preview[] | undefined | null;
  title: string | undefined;
  customTitles?: (string | null)[];
  gender?: string;
};

export const SyncedCarousels = ({
  collectionsData,
  previews,
  customTitles,
  gender,
}: SyncedCarouselsProps) => {
  const [api1, setApi1] = useState<CarouselApi>();
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [api2, setApi2] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const onSelect = useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      if (api1 && api2) {
        if (api === api1) {
          api2.scrollTo(api1.selectedScrollSnap());
        } else {
          api1.scrollTo(api2.selectedScrollSnap());
          setSelectedIndex(api2.selectedScrollSnap());
        }
      }
    },
    [api1, api2],
  );

  const onInit = useCallback((api: CarouselApi) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);

  useEffect(() => {
    if (api1) api1.on('select', onSelect);
    if (api2) {
      api2.on('select', onSelect);
      api2.on('reInit', onSelect);
      initTimerRef.current = setTimeout(() => onInit(api2), 0);
    }

    return () => {
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
      if (api1) api1.off('select', onSelect);
      if (api2) {
        api2.off('select', onSelect);
        api2.off('reInit', onSelect);
      }
    };
  }, [api1, api2, onSelect, onInit]);
  const previewLinks = collectionsData.map((collection) =>
    stripGenderFromHandle(collection?.alternateHandle || ''),
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2  w-full container gap-2">
      <div className="py-8 flex justify-start">
        <Carousel opts={{ loop: true }} setApi={setApi1}>
          <CarouselContent className="[&>div]:ml-0">
            {previews?.map(
              (preview, index) =>
                preview &&
                preview.asset && (
                  <CarouselItem key={preview._key} className="w-full ">
                    <Link
                      href={
                        gender
                          ? `/${gender}/${previewLinks[index]}`
                          : `/${previewLinks[index]}`
                      }
                      scroll
                      prefetch
                      className=" w-full overflow-hidden flex justify-center h-full"
                    >
                      <Image
                        src={urlFor(preview).url()}
                        alt={preview.alt || 'Preview image'}
                        width={1000}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover w-full max-h-[600px] max-w-[600px] rounded"
                      />
                    </Link>
                  </CarouselItem>
                ),
            )}
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
      </div>
      <div className="flex items-center md:py-8 flex-col ">
        <Carousel
          opts={{ loop: true }}
          setApi={setApi2}
          className="flex h-full mb-12 flex-col justify-center items-center "
        >
          <CarouselContent className="h-fit [&>div]:ml-0  ">
            {collectionsData.filter(Boolean).map((collection, index) => (
              <CarouselItem key={index} className="pl-1 ">
                <div className="w-full flex justify-center mb-8">
                  <h3 className="text-3xl font-medium">
                    {customTitles?.[index] || collection?.collection?.collection?.title}
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-1 md:gap-2 pb-1">
                  {collection?.collection?.collection?.products.edges
                    ?.slice(0, 3)
                    .map(
                      (
                        product: NonNullable<
                          GetCollectionQuery['collection']
                        >['products']['edges'][0],
                      ) =>
                        product && (
                          <div key={product.node.handle} className="group">
                            <ProductCard
                              product={product.node as any as Product}
                              withCarousel={false}
                              withQuick={false}
                              withSizes={false}
                              withInnerShadow
                              className="px-0 py-0 pb-2 hover:shadow rounded-b rounded-t"
                            />
                          </div>
                        ),
                    )}
                </div>
              </CarouselItem>
            ))}
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
    </div>
  );
};
