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
import getSymbolFromCurrency from 'currency-symbol-map';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';

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
  gender?: string;
};

export const SyncedCarousels = ({
  collectionsData,
  previews,
  gender,
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
      setTimeout(() => onInit(api2), 0);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2  md:gap-4 lg:gap-6 w-full container ">
      <div className="py-8">
        <Carousel opts={{ loop: true }} setApi={setApi1}>
          <CarouselContent className='[&>div]:-ml-0'>
            {previews?.map(
              (preview) =>
                preview &&
                preview.asset && (
                  <CarouselItem key={preview._key}>
                    <Link
                      href={gender ? `/${gender}/${preview.handle?.current}` : `/${preview.handle?.current}`}
                      scroll
                      prefetch
                    >
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
      <div className="flex items-center md:py-8 flex-col">
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
                <div className="w-full flex justify-center mb-8">
                  <h3 className="text-2xl font-medium">
                    {collection?.collection?.collection?.title}
                  </h3>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 ml-2 px-4 md:px-2">
                  {collection?.collection?.collection?.products?.edges
                    ?.slice(0, 3)
                    .map(
                      (
                        product: NonNullable<
                          GetCollectionQuery['collection']
                        >['products']['edges'][0],
                      ) =>
                        product && (
                          <div key={product.node.handle} className="group">
                            <Link
                              href={`/product/${product.node.handle}`}
                              scroll={true}
                              prefetch
                            >
                              <div className="relative w-full aspect-square overflow-hidden bg-background mb-3">
                                <Image
                                  src={
                                    product.node.media.edges[0].node
                                      .previewImage?.url
                                  }
                                  alt={product.node.title}
                                  fill
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* {product.node.metafield &&
                                  product.node.metafield.key === 'znizka' &&
                                  product.node.metafield.value &&
                                  Number(product.node.metafield.value) > 0 && (
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-sm">
                                      -{product.node.metafield.value}%
                                    </div>
                                  )} */}
                              </div>
                            </Link>

                            {/* Product Info */}
                            <div className="space-y-1">
                              {/* Vendor */}
                              <Link
                                href={`/brand/${vendorToHandle(product.node.vendor)}`}
                              >
                                <p className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors">
                                  {product.node.vendor}
                                </p>
                              </Link>

                              {/* Title */}
                              <Link href={`/product/${product.node.handle}`}>
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight hover:text-gray-700 transition-colors">
                                  {product.node.title}
                                </h4>
                              </Link>

                              {/* Price */}
                              <div className="flex items-center gap-2 pt-1">
                                {product.node.metafield &&
                                product.node.metafield.key === 'znizka' &&
                                product.node.metafield.value &&
                                Number(product.node.metafield.value) > 0 ? (
                                  <>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {(
                                        product.node.priceRange?.maxVariantPrice
                                          .amount *
                                        (1 -
                                          parseFloat(
                                            product.node.metafield.value,
                                          ) /
                                            100)
                                      ).toFixed(0)}{' '}
                                      {getSymbolFromCurrency(
                                        product.node.priceRange?.maxVariantPrice
                                          .currencyCode,
                                      ) ||
                                        product.node.priceRange?.maxVariantPrice
                                          .currencyCode}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                      {parseFloat(
                                        product.node.priceRange?.maxVariantPrice
                                          .amount,
                                      ).toFixed(0)}{' '}
                                      {getSymbolFromCurrency(
                                        product.node.priceRange?.maxVariantPrice
                                          .currencyCode,
                                      ) ||
                                        product.node.priceRange?.maxVariantPrice
                                          .currencyCode}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-gray-900">
                                    {parseFloat(
                                      product.node.priceRange?.maxVariantPrice
                                        .amount,
                                    ).toFixed(0)}{' '}
                                    {getSymbolFromCurrency(
                                      product.node.priceRange?.maxVariantPrice
                                        .currencyCode,
                                    ) ||
                                      product.node.priceRange?.maxVariantPrice
                                        .currencyCode}
                                  </span>
                                )}
                              </div>
                            </div>
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
