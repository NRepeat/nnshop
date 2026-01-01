'use client';

import { Product } from '@shared/lib/shopify/types/storefront.types';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@shared/ui/button';

type ProductCardSPPProps = {
  product: Product;
};

export const ProductCardSPP = ({ product }: ProductCardSPPProps) => {
  const imageUrl = product.featuredImage?.url;
  const imageAlt = product.featuredImage?.altText || product.title;
  const imageWidth = product.featuredImage?.width || 300;
  const imageHeight = product.featuredImage?.height || 300;

  return (
    <div className="flex flex-col gap-3 group">
      <Link
        href={`/products/${product.handle}`}
        className="relative block overflow-hidden"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="object-cover w-full h-auto"
          />
        )}
        <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" className="rounded-full bg-black text-white">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </Link>
      <div className="flex flex-col">
        <Link href={`/products/${product.handle}`}>
          <p className="text-sm font-medium">{product.title}</p>
        </Link>
        <p className="text-sm text-gray-700">
          {product.priceRange.maxVariantPrice.amount}{' '}
          {product.priceRange.maxVariantPrice.currencyCode}
        </p>
      </div>
    </div>
  );
};
