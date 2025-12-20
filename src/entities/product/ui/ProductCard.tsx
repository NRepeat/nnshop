'use client';
import { Card, CardContent } from '@/shared/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { AddToCartButton } from './AddToCartButton';
import clsx from 'clsx';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';
import { useState } from 'react';
import { useDotButton } from '@shared/hooks/useDotButton';

type ProductCardProps = {
  product: Product;
  addToCard?: boolean;
  className?: string;
  withCarousel?: boolean;
};

export const ProductCard = ({
  product,
  addToCard = true,
  className,
  withCarousel = false,
}: ProductCardProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
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
  const { selectedIndex, onDotButtonClick } = useDotButton(carouselApi);

  const CardDots = () => {
    if (!carouselApi) return null;
    const handleDotClick = (
      event: React.MouseEvent<HTMLButtonElement>,
      index: number,
    ) => {
      event.stopPropagation();
      onDotButtonClick(index);
    };
    return (
      <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20 gap-0.5">
        {productImages.map((_, index) => (
          <button
            key={index}
            className={clsx(
              'w-2 h-2 rounded-full transition-all duration-300',
              selectedIndex === index ? 'bg-primary' : 'bg-gray-300',
            )}
            onClick={(event) => handleDotClick(event, index)}
          />
        ))}
      </div>
    );
  };
  return (
    <Card
      className={clsx(
        'h-full shadow-none backdrop-blur-sm bg-transparent border-gray-200 border-nonerounded-xl cursor-pointer  py-1 px-0.5 md:px-1.5 ',
        className,
      )}
    >
      <CardContent className="  flex flex-col  rounded-none p-0 border-0 shadow-none h-full justify-between bg-transparent">
        <Link href={`/products/${product.handle}`}>
          {withCarousel ? (
            <Carousel
              className="relative"
              opts={{ align: 'center' }}
              setApi={setCarouselApi}
            >
              <CarouselContent>
                {productImages.map((image, index) => (
                  <CarouselItem key={index} className=" ">
                    <div className="relative flex justify-center items-center overflow-hidden  border-sidebar-ring w-full">
                      <Image
                        key={index}
                        className=" w-full max-h-[350px] h-[350px] object-contain"
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
              <CardDots />
            </Carousel>
          ) : (
            <div className="relative flex justify-center items-center overflow-hidden  border-sidebar-ring w-full">
              <Image
                className=" w-full max-h-[350px] h-[350px]"
                src={productImages[0].url}
                alt={productImages[0].altText || ''}
                width={productImages[0].width || 300}
                height={productImages[0].height || 300}
              />
            </div>
          )}
        </Link>
        {
          <div className="w-full pt-2 md:pt-6  flex flex-col gap-1 flex-1">
            <span className="text-md font-bold">{product.vendor}</span>
            <div className="flex flex-col justify-between flex-1">
              <div className=" w-full flex-col  justify-between flex pb-4">
                <Link href={`/products/${product.handle}`}>
                  <p className="text-md font-light  text-pretty">
                    {product?.title}
                  </p>
                </Link>
                <span className="text-md font-light text-pretty">
                  Slize:{' '}
                  {product?.options.find((f) => f.name === 'Size')
                    ?.optionValues[0].name || 'N/A'}
                </span>
              </div>
              <span>
                {product.priceRange.maxVariantPrice.currencyCode}{' '}
                {product.priceRange.maxVariantPrice.amount}
              </span>
            </div>
          </div>
        }

        {addToCard && (
          <div className=" w-full mt-1 md:mt-4 flex justify-center">
            <AddToCartButton
              product={product}
              variant="outline"
              className="w-full   rounded-none mt-2 bg-transparent border shadow-none"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
