'use client';
import { Link } from '@shared/i18n/navigation';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { Product } from '@shared/lib/shopify/types/storefront.types';

type SearchResultsGridProps = {
  products: Product[];
  onProductClick?: () => void;
};

/**
 * Shared responsive grid for search results.
 *
 * NOTE on Link wrapping (R-02 resolution):
 * `ProductCardSPP` already wraps its image and title in <Link> internally
 * via its `link` prop (default `true`). To avoid nested-anchor hydration
 * warnings AND still allow the popup to close on click, we keep
 * `ProductCardSPP` with `link` enabled (its internal Links handle
 * navigation) and attach `onProductClick` as an outer wrapper element's
 * `onClick`. We use a `<div>` with click handler that fires when any
 * inner anchor click bubbles up — this closes the popup without
 * introducing a nested <a>.
 */
export function SearchResultsGrid({
  products,
  onProductClick,
}: SearchResultsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
      {products.map((p) => (
        <div
          key={p.id}
          onClick={onProductClick}
          className="flex flex-col gap-2"
        >
          <ProductCardSPP product={p} />
        </div>
      ))}
    </div>
  );
}

// Suppress unused-import lint if Link ever needed; kept for future page-level
// override.
void Link;
