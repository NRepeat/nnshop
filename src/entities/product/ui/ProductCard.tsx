'use client';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Card, CardContent } from '@/shared/ui/card';
import Image from 'next/image';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';
import {
  Carousel,
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

type ProductCardProps = {
  product: Product;
  isFav?: boolean;
  addToCard?: boolean;
  className?: string;
  withCarousel?: boolean;
};

export const ProductCard = ({
  product,
  className,
  withCarousel = false,
  isFav,
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

    return sizeOption.optionValues
      ?.map((v) => v.name)
      .filter((name) => availableValues.has(name)) ?? [];
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
  return (
    <Card
      className={clsx(
        'h-full shadow-none backdrop-blur-sm bg-transparent border border-background cursor-pointer py-1 group pb-4',
        className,
      )}
    >
      <CardContent className="flex flex-col p-0 md:p-1 border-0 shadow-none h-full gap-4 bg-transparent">
        <Link href={`/product/${product.handle}`} prefetch>
          {withCarousel ? (
            <Carousel className="relative" opts={{ align: 'center' }}>
              <div className="group relative md:aspect-square w-full overflow-hidden">
                {isNew && (
                  <Badge className="absolute top-2 left-2 z-10">
                    {t('new')}
                  </Badge>
                )}
                <CarouselContent className="[&>div]:-ml-0">
                  {productImages.map((image, index) => (
                    <CarouselItem key={index} className=" relative">
                      <div className="relative w-full h-full aspect-[3/4] md:aspect-square flex justify-center items-center">
                        <Image
                          key={index}
                          className="object-contain "
                          src={image.url}
                          alt={image.altText || ''}
                          // loading="lazy"
                          preload
                          // priority={index === 0 ? true : undefined}
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
                  className="group-hover:flex hidden md:hover:flex bg-background/70 rounded-full top-1/2 right-2 absolute"
                />
                <CarouselPrevious
                  variant={'ghost'}
                  className="group-hover:flex hidden md:hover:flex bg-background/70 rounded-full top-1/2 left-2 absolute"
                />
                <div
                  className={cn('absolute top-0  right-2   group-hover:block', {
                    hidden: !isFav,
                  })}
                >
                  <FavSession
                    fav={isFav}
                    productId={product.id}
                    handle={product.handle}
                  />
                </div>
                {availableSizes.length > 0 && (
                  <div className="absolute bottom-0 left-2 px-2 py-1.5 hidden group-hover:flex flex-col gap-1 bg-background/70 rounded-md">
                    {availableSizes.map((size) => (
                      <span
                        key={size}
                        className="text-[10px] md:text-xs px-2 py-0.5  border rounded text-center"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}
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
              </div>
            </Carousel>
          ) : (
            <div className="group relative aspect-square w-full overflow-hidden">
              {isNew && (
                <Badge className="absolute top-2 left-2 z-10">{t('new')}</Badge>
              )}
              <div className="relative  md:h-full w-full flex justify-center items-center">
                <Image
                  className="object-contain"
                  src={productImages[0].url}
                  alt={productImages[0].altText || ''}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              {availableSizes.length > 0 && (
                <div className="absolute bottom-0 left-2 px-2 py-1.5 hidden group-hover:flex flex-col gap-1">
                  {availableSizes.map((size) => (
                    <span
                      key={size}
                      className="text-[10px] md:text-xs px-1.5 py-0.5 border rounded text-center"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              )}
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
            </div>
          )}
        </Link>
          <div className="w-full pt-2 md:pt-1  flex flex-col gap-1 flex-1 md:px-2 max-h-fit">
            <Link href={`/brand/${vendorToHandle(product.vendor)}`}>
              <span className="text-md font-bold hover:underline">
                {decodeHtmlEntities(product.vendor)}
              </span>
            </Link>
            {product.productType && (
              <span className="text-xs text-muted-foreground">
                {product.productType}
              </span>
            )}
            <div className="flex flex-col justify-between flex-1">
              <div className=" w-full flex-col  justify-between flex pb-4">
                <Link href={`/productt/${product.handle}`}>
                  <p className="text-sm md:text-md font-light  text-pretty">
                    {decodeHtmlEntities(product?.title ?? '')}
                  </p>
                </Link>
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
                      {getSymbolFromCurrency(
                        product.priceRange?.maxVariantPrice.currencyCode,
                      ) || product.priceRange?.maxVariantPrice.currencyCode}
                    </span>

                    <span className="text-red-600 font-bold text-sm">
                      {(
                        product.priceRange?.maxVariantPrice.amount *
                        (1 - parseFloat(product.metafield.value) / 100)
                      ).toFixed(0)}{' '}
                      {getSymbolFromCurrency(
                        product.priceRange?.maxVariantPrice.currencyCode,
                      ) || product.priceRange?.maxVariantPrice.currencyCode}
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
                    {getSymbolFromCurrency(
                      product.priceRange?.maxVariantPrice.currencyCode,
                    ) || product.priceRange?.maxVariantPrice.currencyCode}
                  </span>
                )}
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  );
};
