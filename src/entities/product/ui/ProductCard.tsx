'use client';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import { Card, CardContent } from '@/shared/ui/card';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';
import Image from 'next/image';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import clsx from 'clsx';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@shared/ui/carousel';
import { useRouter } from '@shared/i18n/navigation';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@shared/i18n/navigation';
import { FavSession } from '@features/header/ui/FavSession';
import { cn } from '@shared/lib/utils';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ZoomIn } from 'lucide-react';
import { AddToCartModal } from '@features/product/ui/AddToCartModal';
import { usePostHog } from 'posthog-js/react';

type ProductCardProps = {
  product: Product;
  isFav?: boolean;
  addToCard?: boolean;
  className?: string;
  withCarousel?: boolean;
  withQuick?: boolean;
  withInnerShadow?: boolean;
  withSizes?: boolean;
  source?: string;
};

export const ProductCard = ({
  product,
  className,
  withCarousel = false,
  isFav,
  withQuick,
  withInnerShadow,
  withSizes = true,
  addToCard,
  source = 'collection',
}: ProductCardProps) => {
  const t = useTranslations('ProductCard');
  const tPage = useTranslations('ProductPage');
  const SIZE_NAMES = ['size', 'розмір', 'размер'];

  const availableSizes = (() => {
    const sizeOption = product.options?.find((opt) =>
      SIZE_NAMES.includes(opt.name.toLowerCase()),
    );
    if (!sizeOption) return [];

    const availableValues = new Set(
      product.variants?.edges
        ?.filter((v) => v.node.availableForSale)
        .map(
          (v) =>
            v.node.selectedOptions?.find((o) => o.name === sizeOption.name)
              ?.value,
        )
        .filter(Boolean),
    );

    const CLOTHING_ORDER = [
      'xxs',
      'xs',
      's',
      'm',
      'l',
      'xl',
      'xxl',
      'xxxl',
      '3xl',
      '4xl',
      'one size',
    ];

    const sizes =
      sizeOption.optionValues
        ?.map((v) => v.name)
        .filter((name) => availableValues.has(name)) ?? [];

    return sizes.sort((a, b) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      const aIdx = CLOTHING_ORDER.indexOf(a.toLowerCase());
      const bIdx = CLOTHING_ORDER.indexOf(b.toLowerCase());
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      return a.localeCompare(b);
    });
  })();

  const productImages = [
    ...(product?.media?.edges?.map((variant) => {
      const raw = variant.node.previewImage?.url || '';
      const sep = raw.includes('?') ? '&' : '?';
      return {
        url: raw ? `${raw}${sep}width=400&height=400&pad_color=ffffff` : '',
        altText: variant.node.previewImage?.altText || '',
        width: 400,
        height: 400,
      };
    }) ?? []),
  ]
    .filter(Boolean)
    .splice(0, 5);

  const nav = useRouter();
  const posthog = usePostHog();
  const isNew = product.tags.includes('новий') || product.tags.includes('new');
  const [api2, setApi2] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAddToCartOpen, setAddToCartOpen] = useState(false);

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

  // Cursor-based image sliding
  const carouselRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!api2 || productImages.length <= 1) return;
      const rect = carouselRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const segmentWidth = rect.width / productImages.length;
      const newIndex = Math.min(
        Math.floor(x / segmentWidth),
        productImages.length - 1,
      );
      if (newIndex !== api2.selectedScrollSnap()) {
        api2.scrollTo(newIndex, true);
      }
    },
    [api2, productImages.length],
  );

  const handleMouseLeave = useCallback(() => {
    if (api2) api2.scrollTo(0, true);
  }, [api2]);

  return (
    <Card
      className={clsx(
        'h-full shadow-none  transition-shadow p-0   backdrop-blur-sm bg-transparent border border-none cursor-pointer group relative',
        className,
      )}
    >
      <Link
        href={`/product/${product.handle}`}
        prefetch
        className="absolute inset-0 z-10"
        aria-label={product.title}
        onClick={() => posthog?.capture('product_card_clicked', {
          product_handle: product.handle,
          product_title: product.title,
          price: product.priceRange?.minVariantPrice?.amount,
          source,
        })}
      />
      <CardContent className="flex flex-col p-1 py-3 md:p-2 md:py-2.5  border-0 shadow-none h-full gap-4 bg-transparent">
        {withInnerShadow && (
          <div className="pointer-events-none absolute inset-0 rounded inset-shadow-sm " />
        )}
        <div>
          {withCarousel ? (
            <Carousel
              className="relative"
              opts={{ align: 'center' }}
              setApi={setApi2}
            >
              <div
                className="group relative md:aspect-square w-full z-20 cursor-pointer"
                onClick={() => nav.push(`/product/${product.handle}`)}
              >
                {/* Mouse tracking overlay (desktop only — on mobile Embla handles touch directly) */}
                <div
                  ref={carouselRef}
                  className="absolute inset-0 z-20 pointer-events-none md:pointer-events-auto"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
                {isNew && (
                  <Badge className="absolute rounded top-1  left-1 z-10 ">
                    {t('new')}
                  </Badge>
                )}
                <CarouselContent className="[&>div]:-ml-0 ">
                  {productImages.map((image, index) => (
                    <CarouselItem key={index} className=" relative">
                      <div className="relative w-full h-full aspect-square flex justify-center items-center rounded-t overflow-hidden">
                        <Image
                          key={index}
                          className="object-cover w-full h-full"
                          src={image.url}
                          alt={image.altText || ''}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          fill
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div
                  className={cn(
                    'absolute top-1.5  right-2 z-20   group-hover:block',
                    {
                      hidden: !isFav,
                    },
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <FavSession
                    fav={isFav}
                    productId={product.id}
                    handle={product.handle}
                  />
                </div>
                {/* Image progress dots */}
                {scrollSnaps.length > 1 && (
                  <div className="flex justify-center gap-1 absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    {scrollSnaps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-[3px] rounded-full transition-all duration-200 ${
                          index === selectedIndex
                            ? 'bg-primary w-4'
                            : 'bg-gray-300 w-2'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {withQuick && (
                  <div className="bottom-2 cursor-pointer left-1/2 -translate-x-1/2 hidden group-hover:flex absolute z-20 items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded text-sm">
                    <ZoomIn className="w-4 h-4" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        posthog?.capture('product_quick_view_opened', {
                          product_handle: product.handle,
                          source,
                        });
                        const currentQuery = window.location.search;
                        nav.push(`/quick/${product.handle}${currentQuery}`, { scroll: false });
                      }}
                      className='cursor-pointer'
                    >
                      {t('quickView')}
                    </button>
                  </div>
                )}
              </div>
            </Carousel>
          ) : (
            <div className="group relative aspect-square w-full overflow-hidden block rounded-t">
              {isNew && (
                <Badge className="absolute rounded top-1  left-1 z-10 ">
                  {t('new')}
                </Badge>
              )}
              <div className="relative aspect-square md:h-full w-full flex justify-center items-center rounded-t overflow-hidden">
                <Image
                  className="object-cover w-full h-full"
                  src={
                    productImages[0]?.url || product.featuredImage?.url || ''
                  }
                  alt={
                    productImages[0]?.altText ||
                    product.featuredImage?.altText ||
                    ''
                  }
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              {withQuick && (
                <div className="bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:flex absolute z-20 items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded text-sm">
                  <ZoomIn className="w-4 h-4" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      posthog?.capture('product_quick_view_opened', {
                        product_handle: product.handle,
                        source,
                      });
                      const currentQuery = window.location.search;
                      nav.push(`/quick/${product.handle}${currentQuery}`, { scroll: false });
                    }}
                  >
                    {t('quickView')}
                  </button>
                </div>
              )}
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
            </div>
          )}
        </div>
        <div className="w-full   flex flex-col gap-1 flex-1 h-full">
          <div className="flex flex-col justify-between flex-1 pl-1 md:pl-3 pb-2.5">
            <Link
              href={`/brand/${vendorToHandle(product.vendor)}`}
              className="relative z-10 mb-2"
            >
              <span className="text-md font-bold group-hover:underline  duration-300 decoration-transparent group-hover:decoration-primary  transition-all">
                {decodeHtmlEntities(product.vendor)}
              </span>
            </Link>
            <div className="w-full flex-col justify-between flex pb-2">
              <p className="text-sm md:text-md font-light text-pretty">
                {decodeHtmlEntities(product?.title ?? '')}
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              {product.metafield &&
              product.metafield.key === DISCOUNT_METAFIELD_KEY &&
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

                  <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
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

              {/* Sizes as text */}
              {withSizes && availableSizes.length > 0 && (
                <p className="text-base text-muted-foreground">
                  {availableSizes.join(' · ')}
                </p>
              )}

              {/* Add to cart — hover only */}
            </div>
          </div>
          {addToCard && (
            <div
              className="relative z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <Button
                className="w-full h-10 text-sm rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setAddToCartOpen(true);
                }}
              >
                {tPage('addToCart')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {addToCard && (
        <AddToCartModal
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          product={product as any}
          open={isAddToCartOpen}
          onOpenChange={setAddToCartOpen}
        />
      )}
    </Card>
  );
};
