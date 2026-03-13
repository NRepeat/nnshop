'use client';
import { useState } from 'react';
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
import { Link } from '@shared/i18n/navigation';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { AddToCartButton } from './AddToCartButton';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';
import { useRouter } from 'next/navigation';

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
    (option) => ['розмір', 'размер', 'size'].includes(option.name.toLowerCase()),
  )?.values;

  type VariantNode = (typeof product.variants.edges)[0]['node'];
  const [selectedVariant, setSelectedVariant] = useState<VariantNode | null>(null);
  const { openCart } = useCartUIStore();
  const router = useRouter();

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
            <h2 className="text-xl font-medium">{decodeHtmlEntities(product.title)}</h2>
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
              {colorOptions.map((color) => {
                const matchingVariant =
                  product.variants.edges.find((edge) =>
                    edge.node.selectedOptions.some(
                      (option) =>
                        option.name.toLowerCase() === 'color' &&
                        option.value.toLowerCase() === color.name.toLowerCase(),
                    ),
                  )?.node ?? null;

                const isSelected =
                  selectedVariant !== null &&
                  selectedVariant.selectedOptions.some(
                    (option) =>
                      option.name.toLowerCase() === 'color' &&
                      option.value.toLowerCase() === color.name.toLowerCase(),
                  );

                const isOutOfStock = matchingVariant
                  ? !matchingVariant.availableForSale
                  : false;

                return (
                  <Button
                    key={color.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="icon"
                    disabled={isOutOfStock}
                    className={`rounded-full w-8 h-8${isOutOfStock ? ' opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (!isOutOfStock && matchingVariant) {
                        setSelectedVariant(matchingVariant);
                      }
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color.name.toLowerCase() }}
                    />
                  </Button>
                );
              })}
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
              {sizeOptions.map((size) => {
                const matchingVariant =
                  product.variants.edges.find((edge) =>
                    edge.node.selectedOptions.some(
                      (option) =>
                        ['розмір', 'размер', 'size'].includes(option.name.toLowerCase()) &&
                        option.value.toLowerCase() === size.toLowerCase(),
                    ),
                  )?.node ?? null;

                const isSelected =
                  selectedVariant !== null &&
                  selectedVariant.selectedOptions.some(
                    (option) =>
                      ['розмір', 'размер', 'size'].includes(option.name.toLowerCase()) &&
                      option.value.toLowerCase() === size.toLowerCase(),
                  );

                const isOutOfStock = matchingVariant
                  ? !matchingVariant.availableForSale
                  : false;

                return (
                  <Button
                    key={size}
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={isOutOfStock}
                    className={isOutOfStock ? 'opacity-50 line-through cursor-not-allowed' : ''}
                    onClick={() => {
                      if (!isOutOfStock && matchingVariant) {
                        setSelectedVariant(matchingVariant);
                      }
                    }}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-auto pt-6 flex flex-col gap-2">
          <AddToCartButton
            // @ts-ignore
            product={product}
            // @ts-ignore
            selectedVariant={selectedVariant ?? undefined}
            variant="default"
            className="w-full bg-black text-white hover:bg-gray-800"
            disabled={selectedVariant === null}
            onSuccess={() => {
              router.back();
              openCart();
            }}
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
