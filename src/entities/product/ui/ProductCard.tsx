'use client';
import { Card, CardContent } from '@/shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';
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
  const isNew = product.tags.includes('новий') || product.tags.includes('New');

  return (
    <Card
      className={clsx(
        'h-full shadow-none backdrop-blur-sm bg-transparent border border-background  rounded-none cursor-pointer  py-1  group pb-4',
        className,
      )}
    >
      <CardContent className="  flex flex-col  rounded-none p-1 border-0 shadow-none h-full justify-between bg-transparent">
        <Link href={`/products/${product.handle}`}>
          {withCarousel ? (
            <Carousel className="relative" opts={{ align: 'center' }}>
              <div className="group relative">
                {isNew && (
                  <Badge className="absolute top-2 left-2 z-10">Новий</Badge>
                )}
                <CarouselContent>
                  {productImages.map((image, index) => (
                    <CarouselItem key={index} className=" relative">
                      <div className="relative flex justify-center items-center overflow-hidden  border-sidebar-ring w-full re">
                        <Image
                          key={index}
                          className=" w-full max-h-[350px] h-[350px] md:max-h-[450px]  lg:max-h-[550px] lg:h-[450px] object-contain"
                          src={image.url}
                          alt={image.altText || ''}
                          width={image.width || 300}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          height={image.height || 300}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext
                  variant={'link'}
                  className="group-hover:flex hidden bg-transparent top-1/2 right-5 absolute"
                />
                <CarouselPrevious
                  variant={'link'}
                  className="group-hover:flex hidden bg-transparent top-1/2 left-5 absolute"
                />
                <div className="absolute top-0  right-5  hidden group-hover:block">
                  <Button
                    size={'icon'}
                    variant={'link'}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <Heart />
                  </Button>
                </div>
                <div className="absolute bottom-0  right-5  hidden group-hover:block">
                  <Button
                    variant={'default'}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      nav.push(`/product/${product.handle}`, {});
                    }}
                  >
                    Quick View
                  </Button>
                </div>
              </div>
            </Carousel>
          ) : (
            <div className="relative flex justify-center items-center overflow-hidden  border-sidebar-ring w-full group">
              {isNew && (
                <Badge className="absolute top-2 left-2 z-10">Новий</Badge>
              )}
              <Image
                className=" w-full max-h-[350px] h-[350px]"
                src={productImages[0].url}
                alt={productImages[0].altText || ''}
                width={productImages[0].width || 300}
                height={productImages[0].height || 300}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group-hover:block">
                <Link
                  href={`/products/${product.handle}`}
                  className="bg-primary text-secondary px-4 py-2 rounded-full"
                >
                  Quick View
                </Link>
              </div>
            </div>
          )}
        </Link>
        {
          <div className="w-full pt-2 md:pt-6  flex flex-col gap-1 flex-1 px-2">
            <span className="text-md font-bold">{product.vendor}</span>
            <div className="flex flex-col justify-between flex-1">
              <div className=" w-full flex-col  justify-between flex pb-4">
                <Link href={`/products/${product.handle}`}>
                  <p className="text-md font-light  text-pretty">
                    {product?.title}
                  </p>
                </Link>
              </div>
              <span>
                {product.priceRange.maxVariantPrice.currencyCode}{' '}
                {Number(product.priceRange.maxVariantPrice.amount).toFixed(0)}
              </span>
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
