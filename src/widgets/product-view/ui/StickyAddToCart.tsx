'use client';

import { useEffect, useState } from 'react';
import { Product as ShopifyProduct, ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import { ProductPrice } from './Price';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';

export function StickyAddToCart({
  product,
  selectedVariant,
  triggerRef,
}: {
  product: ShopifyProduct;
  selectedVariant?: ProductVariant;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  const sale = product.metafields.find((m) => m?.key === DISCOUNT_METAFIELD_KEY)?.value || '0';

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-muted px-4 py-3 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <ProductPrice product={product} selectedVariant={selectedVariant} sale={sale} compact />
        </div>
        <div className="flex-1">
          <AddToCartButton
            product={product}
            variant="default"
            selectedVariant={selectedVariant || product.variants.edges[0]?.node}
            className="w-full h-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
