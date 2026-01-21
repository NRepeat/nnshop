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
import { Heart } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@shared/i18n/navigation';
import { addToFavorites } from '@entities/favorite/api/add-to-fav';

type ProductCardProps = {
  product: Product;
  addToCard?: boolean;
  className?: string;
  withCarousel?: boolean;
};

export const ProductCard = ({
  product,
  className,
  withCarousel = false,
}: ProductCardProps) => {
  const t = useTranslations('ProductCard');
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
  const handleAddToFavorites = async (e: React.MouseEvent) => {
    const data = await addToFavorites(product.id, '1');
    console.log(data, 'data');
    if (!data) {
      nav.push(`/auth/sign-in`, { scroll: false });
    }
  };
  return (
    <Card
      className={clsx(
        'h-full shadow-none backdrop-blur-sm bg-transparent border border-background  rounded-none cursor-pointer  py-1  group pb-4',
        className,
      )}
    >
      <CardContent className="  flex flex-col  rounded-none p-0 md:p-1 border-0 shadow-none h-full justify-between bg-transparent">
        <Link href={`/product/${product.handle}`}>
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
                          loading="lazy"
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
                <div className="absolute top-2  right-2  hidden group-hover:block">
                  <Button
                    size={'icon'}
                    variant={'ghost'}
                    className="hover:[&>svg]:stroke-[#e31e24] bg-background/70 rounded-full"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      await handleAddToFavorites(e);
                    }}
                  >
                    <Heart className="" />
                  </Button>
                </div>
                <div className=" bottom-2  right-2  flex w-full justify-end absolute">
                  <Button
                    variant={'ghost'}
                    className="group-hover:flex hidden bg-background/70 rounded-full"
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
                />
              </div>
              <div className=" bottom-2 left-1/2 -translate-x-1/2 hidden group-hover:block absolute">
                <Button
                  variant={'ghost'}
                  className="bg-background/70 rounded-full"
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
        {
          <div className="w-full pt-2 md:pt-1  flex flex-col gap-1 flex-1 md:px-2">
            <span className="text-md font-bold">{product.vendor}</span>
            <div className="flex flex-col justify-between flex-1">
              <div className=" w-full flex-col  justify-between flex pb-4">
                <Link href={`/productt/${product.handle}`}>
                  <p className="text-sm md:text-md font-light  text-pretty">
                    {product?.title}
                  </p>
                </Link>
              </div>
              <div className="mt-auto">
                {product.metafield &&
                product.metafield.key === 'znizka' &&
                Number(product.metafield.value) !== 0 ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="line-through text-gray-500 text-xs">
                      {parseFloat(
                        product.priceRange.maxVariantPrice.amount,
                      ).toFixed(0)}{' '}
                      {getSymbolFromCurrency(
                        product.priceRange.maxVariantPrice.currencyCode,
                      ) || product.priceRange.maxVariantPrice.currencyCode}
                    </span>

                    <span className="text-red-600 font-bold text-sm">
                      {(
                        product.priceRange.maxVariantPrice.amount *
                        (1 - parseFloat(product.metafield.value) / 100)
                      ).toFixed(0)}{' '}
                      {getSymbolFromCurrency(
                        product.priceRange.maxVariantPrice.currencyCode,
                      ) || product.priceRange.maxVariantPrice.currencyCode}
                    </span>

                    <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                      -{product.metafield.value}%
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-sm">
                    {parseFloat(
                      product.priceRange.maxVariantPrice.amount,
                    ).toFixed(0)}{' '}
                    {getSymbolFromCurrency(
                      product.priceRange.maxVariantPrice.currencyCode,
                    ) || product.priceRange.maxVariantPrice.currencyCode}
                  </span>
                )}
              </div>
            </div>
          </div>
        }

        {/*{addToCard && (
            <div className=" w-full mt-1 md:mt-4 flex justify-center px-2">
              <AddToCartButton
                product={product}
                variant="outline"
                className="w-full   rounded-none mt-2 bg-transparent border shadow-none"
              />
            </div>
          )}*/}
      </CardContent>
    </Card>
  );
};
