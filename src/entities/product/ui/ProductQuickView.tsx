'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@shared/ui/carousel';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import Image from 'next/image';
import { Button } from '@shared/ui/button';
import Link from 'next/link';
import { AddToCartButton } from './AddToCartButton';

type ProductQuickViewProps = {
  product: Product;
};

export const ProductQuickView = ({ product }: ProductQuickViewProps) => {
  const productImages = product.images.edges
    .map((edge) => edge.node)
    .filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'color',
  )?.optionValues;
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  )?.values;

  return (
    <div className="bg-background  flex gap-8 w-full max-w-full p-4">
      <div className="w-1/2">
        <Carousel>
          <CarouselContent>
            {productImages?.map((image, index) => (
              <CarouselItem key={index}>
                <Image
                  src={image?.url}
                  alt={image?.altText || product.title}
                  width={image?.width || 400}
                  height={image?.height || 400}
                  className="object-contain w-full h-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-medium">{product.title}</h2>
            <p className="text-lg">
              {product.priceRange?.maxVariantPrice.amount}{' '}
              {product.priceRange?.maxVariantPrice.currencyCode}
            </p>
          </div>
        </div>
        {colorOptions && (
          <div className="mt-2">
            <h3 className="text-sm">Color</h3>
            <div className="flex gap-2 mt-1">
              {colorOptions.map((color) => (
                <Button
                  key={color.id}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-8 h-8"
                >
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color.name.toLowerCase() }}
                  />
                </Button>
              ))}
            </div>
          </div>
        )}
        {sizeOptions && (
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Product Size:</h3>
              <Link href="#" className="text-sm underline">
                Size Chart
              </Link>
            </div>
            <div className="flex gap-2 mt-1">
              {sizeOptions.map((size) => (
                <Button key={size} variant="outline">
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          <AddToCartButton
            product={product}
            variant="default"
            className="w-full bg-black text-white hover:bg-gray-800"
          />
          <Link
            href={`/product/${product.handle}`}
            className="block text-center text-sm underline"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
};
