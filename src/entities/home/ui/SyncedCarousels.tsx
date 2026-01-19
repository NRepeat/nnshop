'use client';

import { Link } from '@shared/i18n/navigation';
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
import getSymbolFromCurrency from 'currency-symbol-map';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@shared/ui/button';

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
  collectionsData: any[];
  previews: Preview[] | undefined | null;
  title: string | undefined;
};

export const SyncedCarousels = ({
  collectionsData,
  previews,
  title,
}: SyncedCarouselsProps) => {
  const [api1, setApi1] = useState<CarouselApi>();
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
      onInit(api2);
    }

    return () => {
      if (api1) api1.off('select', onSelect);
      if (api2) {
        api2.off('select', onSelect);
        api2.off('reInit', onSelect);
      }
    };
  }, [api1, api2, onSelect, onInit]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4  md:gap-20 w-full container ">
      <div className="py-8">
        <Carousel opts={{ loop: true }} setApi={setApi1}>
          <CarouselContent>
            {previews?.map(
              (preview) =>
                preview &&
                preview.asset && (
                  <CarouselItem key={preview._key}>
                    <Link href={`/collection/${preview.handle?.current}`}>
                      <Image
                        src={urlFor(preview).url()}
                        alt={preview.alt || 'Preview image'}
                        width={500}
                        height={500}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain w-full max-h-[calc(500px)] md:max-h-[calc(700px)]"
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
      <div className="flex items-center py-8 flex-col">
        <Carousel
          opts={{ loop: true }}
          setApi={setApi2}
          className="flex h-full mb-12 flex-col justify-center items-center"
        >
          <div className="mb-12">
            <p className="text-2xl font-bold text-center">{}</p>
          </div>
          <CarouselContent className="h-fit">
            {collectionsData.filter(Boolean).map((collection, index) => (
              <CarouselItem key={index}>
                <div className="w-full flex justify-center">
                  <p className="text-2xl ">{collection.collection?.title}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 px-5 ">
                  {collection.collection?.products?.edges?.slice(0, 3).map(
                    (
                      product: NonNullable<
                        GetCollectionQuery['collection']
                      >['products']['edges'][0],
                    ) =>
                      product && (
                        <div key={product.node.handle}>
                          <Link
                            href={`/product/${product.node.handle}`}
                            className="h-full"
                          >
                            <div className="flex flex-col gap-3 group relative overflow-hidden h-full">
                              <div className="flex justify-start w-full">
                                <div className="relative aspect-[1/1] w-full ">
                                  <Image
                                    src={
                                      product.node.media.edges[0].node
                                        .previewImage?.url
                                    }
                                    alt={product.node.title}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                                    className="object-contain w-full transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col flex-grow">
                                <p className="text-start font-sans text-base group-hover:underline line-clamp-2 min-h-[3rem] mb-1 max-w-[220px]">
                                  {product.node.title}
                                </p>
                                <div className="mt-auto">
                                  {product.node.metafield &&
                                  product.node.metafield.key === 'znizka' ? (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="line-through text-gray-500 text-xs">
                                        {
                                          product.node.priceRange
                                            .maxVariantPrice.amount
                                        }{' '}
                                        {getSymbolFromCurrency(
                                          product.node.priceRange
                                            .maxVariantPrice.currencyCode,
                                        ) ||
                                          product.node.priceRange
                                            .maxVariantPrice.currencyCode}
                                      </span>

                                      <span className="text-red-600 font-bold text-sm">
                                        {(
                                          product.node.priceRange
                                            .maxVariantPrice.amount *
                                          (1 -
                                            parseFloat(
                                              product.node.metafield.value,
                                            ) /
                                              100)
                                        ).toFixed(2)}{' '}
                                        {getSymbolFromCurrency(
                                          product.node.priceRange
                                            .maxVariantPrice.currencyCode,
                                        ) ||
                                          product.node.priceRange
                                            .maxVariantPrice.currencyCode}
                                      </span>

                                      <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                                        -{product.node.metafield.value}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-bold text-sm">
                                      {
                                        product.node.priceRange.maxVariantPrice
                                          .amount
                                      }{' '}
                                      {getSymbolFromCurrency(
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode,
                                      ) ||
                                        product.node.priceRange.maxVariantPrice
                                          .currencyCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ),
                  )}
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
          <div className="flex justify-center gap-2 mt-4">
            {scrollSnaps.map((_, index) => (
              <Button
                key={index}
                className={`w-2 h-2 p-1 px-3 rounded-full ${
                  index === selectedIndex ? 'bg-gray-800' : 'bg-gray-300'
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
