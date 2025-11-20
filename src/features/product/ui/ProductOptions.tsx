'use client';

import { Product } from '@shared/types/product/types';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import Option from '@entities/product/ui/Option';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';

export function ProductOptions({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: ProductVariant;
}) {
  return (
    <>
      <Option product={product} selectedVariant={selectedVariant} />
      <AddToCartButton product={product} selectedVariant={selectedVariant} />
    </>
  );
}
