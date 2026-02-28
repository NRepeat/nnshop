'use client';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import { Card, CardContent } from '@/shared/ui/card';
import Image from 'next/image';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';
import { useRouter } from 'next/navigation';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@shared/i18n/navigation';
import { FavSession } from '@features/header/ui/FavSession';
import { cn } from '@shared/lib/utils';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { useState, useCallback, useRef, useEffect } from 'react';

type ProductCardProps = {
  product: Product;
  isFav?: boolean;
  addToCard?: boolean;
  className?: string;
  withCarousel?: boolean;
  withQuick?: boolean;
  withInnerShadow?: boolean;
  withSizes?: boolean;
};

export const ProductCard = ({
  product,
  className,
  withCarousel = false,
  isFav,
  withQuick,
  withInnerShadow,
  withSizes = true,
}: ProductCardProps) => {
  const t = useTranslations('ProductCard');
  const availableSizes = (() => {
    const sizeOption = product.options?.find((opt) =>
      ['size', 'розмір', 'размер'].includes(opt.name.toLowerCase()),
    );
    if (!sizeOption) return [];

    const sizeOptionIndex = product.options?.indexOf(sizeOption) ?? 0;

    const availableValues = new Set(
      product.variants?.edges
        ?.filter((v) => v.node.availableForSale)
        .map((v) => v.node.selectedOptions?.[sizeOptionIndex]?.value)
        .filter(Boolean),
    );

    return (
      sizeOption.optionValues
        ?.map((v) => v.name)
        .filter((name) => availableValues.has(name)) ?? []
    );
  })();

  const productImages = [
    ...product?.media.edges.map((variant) => ({
      url: variant.node.previewImage?.url || '',
      altText: variant.node.previewImage?.altText || '',
      width: variant.node.previewImage?.width || 300,
      height: variant.node.previewImage?.height || 300,
    })),
  ]
    .filter(Boolean)
    .splice(0, 5);
  const nav = useRouter();
  const isNew = product.tags.includes('новий') || product.tags.includes('new');
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
      setSelectedIndex(0);
      setScrollSnaps([]);
    };
  }, [api2, onSelect, onInit]);
  return (
    <Card
      className={clsx(
        'h-full shadow-none  transition-shadow   backdrop-blur-sm bg-transparent border border-none cursor-pointer group ',
        className,
      )}
    >
      <CardContent className="flex flex-col px-1 md:px-2 pt-2 border-0 shadow-none h-full gap-4 bg-transparent">
        {withInnerShadow && (
          <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
        )}
        <Link href={`/product/${product.handle}`} prefetch>
          {withCarousel ? (
            <Carousel
              className="relative"
              opts={{ align: 'center' }}
              setApi={setApi2}
            >
              <div className="group relative md:aspect-square w-full ">
                {isNew && (
                  <Badge className="absolute rounded-md top-1.5  left-2 z-10 ">
                    {t('new')}
                  </Badge>
                )}
                <CarouselContent className="[&>div]:-ml-0 ">
                  {productImages.map((image, index) => (
                    <CarouselItem key={index} className=" relative">
                      <div className="relative w-full  h-full aspect-square flex justify-center items-center rounded-t overflow-hidden">
                        <Image
                          key={index}
                          className="object-cover w-[1000px] h-auto "
                          src={image.url}
                          alt={image.altText || ''}
                          priority={index === 0 ? true : undefined}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          fill
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext
                  variant={'ghost'}
                  size={'icon'}
                  className="group-hover:flex  rounded-md rounded-bl-none  rounded-br-none  rounded-tr-none hidden w-12 md:hover:flex bg-background/40 bottom-0 right-0 absolute"
                />
                <CarouselPrevious
                  variant={'ghost'}
                  className="group-hover:flex hidden w-12 md:hover:flex bg-background/40  rounded-md rounded-bl-none  rounded-br-none rounded-tl-none bottom-0 left-0 absolute"
                />
                <div
                  className={cn(
                    'absolute top-1.5  right-2 z-20   group-hover:block',
                    {
                      hidden: !isFav,
                    },
                  )}
                >
                  <FavSession
                    fav={isFav}
                    productId={product.id}
                    handle={product.handle}
                  />
                </div>
                <div className="flex justify-center gap-2 mt-4 absolute bottom-0 left-1/2 -translate-x-1/2">
                  {scrollSnaps.map((_, index) => (
                    <Button
                      key={index}
                      className={`w-2 h-[5px]  py-0 px-3  ${
                        index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        api2?.scrollTo(index);
                      }}
                    />
                  ))}
                </div>
                {withQuick && (
                  <div className=" bottom-0 left-2  flex w-full justify-end absolute rounded-md">
                    <Button
                      variant={'ghost'}
                      className="group-hover:flex hidden bg-background/70 rounded-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        nav.push(`/quick/${product.handle}`, { scroll: false });
                      }}
                    >
                      {t('quickView')}
                    </Button>
                  </div>
                )}
              </div>
            </Carousel>
          ) : (
            <div className="group relative aspect-square w-full overflow-hidden">
              {isNew && (
                <Badge className="absolute rounded-md top-1.5  left-2 z-10 ">
                  {t('new')}
                </Badge>
              )}
              <div className="relative aspect-square  md:h-full w-full flex justify-center items-center rounded-t overflow-hidden">
                <Image
                  className="object-cover w-[1000px] h-auto"
                  src={productImages[0].url}
                  alt={productImages[0].altText || ''}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              {withQuick && (
                <div className=" bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:block absolute">
                  <Button
                    variant={'ghost'}
                    className="bg-background/70 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      nav.push(`/product/${product.handle}`, {});
                    }}
                  >
                    {t('quickView')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Link>
        <div className="w-full pl-1 md:pl-3 pb-1   flex flex-col gap-1 flex-1 h-full">
          <Link href={`/brand/${vendorToHandle(product.vendor)}`}>
            <span className="text-md font-bold group-hover:underline  duration-300 decoration-transparent group-hover:decoration-primary  transition-all">
              {decodeHtmlEntities(product.vendor)}
            </span>
          </Link>
          <div className="flex flex-col justify-between flex-1">
            <div className=" w-full flex-col  justify-between flex pb-4 ">
              <Link href={`/product/${product.handle}`}>
                <p className="text-sm md:text-md font-light  text-pretty">
                  {decodeHtmlEntities(product?.title ?? '')}
                </p>
              </Link>
              {withSizes && availableSizes.length > 0 && (
                <p className="text-base text-muted-foreground mt-1">
                  {availableSizes.join(' · ')}
                </p>
              )}
            </div>
            <div className="mt-auto">
              {product.metafield &&
              product.metafield.key === 'znizka' &&
              product.metafield.value &&
              Number(product.metafield.value) > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="line-through text-gray-500 text-xs">
                    {parseFloat(
                      product.priceRange?.maxVariantPrice.amount,
                    ).toFixed(0)}{' '}
                    {getCurrencySymbol(
                      product.priceRange?.maxVariantPrice.currencyCode,
                    )}
                  </span>

                  <span className="text-red-600 font-bold text-sm">
                    {(
                      product.priceRange?.maxVariantPrice.amount *
                      (1 - parseFloat(product.metafield.value) / 100)
                    ).toFixed(0)}{' '}
                    {getCurrencySymbol(
                      product.priceRange?.maxVariantPrice.currencyCode,
                    )}
                  </span>

                  <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded-md">
                    -{product.metafield.value}%
                  </span>
                </div>
              ) : (
                <span className="font-bold text-sm">
                  {parseFloat(
                    product.priceRange?.maxVariantPrice.amount,
                  ).toFixed(0)}{' '}
                  {getCurrencySymbol(
                    product.priceRange?.maxVariantPrice.currencyCode,
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
