'use client';
import getSymbolFromCurrency from 'currency-symbol-map';
import Image from 'next/image';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { Link } from '@shared/i18n/navigation';
import { FavSession } from '@features/header/ui/FavSession';
import { useState } from 'react';
import { cn } from '@shared/lib/utils';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';

type FavoriteProductCardProps = {
  product: Product;
};

export const FavoriteProductCard = ({ product }: FavoriteProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productImages = [
    ...product?.media.edges.map((variant) => ({
      url: variant.node.previewImage?.url || '',
      altText: variant.node.previewImage?.altText || '',
    })),
  ]
    .filter(Boolean)
    .slice(0, 5);

  const hasDiscount =
    product.metafield &&
    product.metafield.key === 'znizka' &&
    product.metafield.value &&
    Number(product.metafield.value) > 0;

  const originalPrice = parseFloat(product.priceRange?.maxVariantPrice.amount);
  const discountedPrice = hasDiscount
    ? originalPrice * (1 - parseFloat(product.metafield?.value || '0') / 100)
    : originalPrice;

  const currencySymbol =
    getSymbolFromCurrency(product.priceRange?.maxVariantPrice.currencyCode) ||
    product.priceRange?.maxVariantPrice.currencyCode;

  return (
    <div className="group relative">
      {/* Image Container */}
      <Link href={`/product/${product.handle}`}>
        <div
          className="relative w-full aspect-square overflow-hidden bg-gray-50 mb-3"
          onMouseEnter={() => setCurrentImageIndex(1 % productImages.length)}
          onMouseLeave={() => setCurrentImageIndex(0)}
        >
          {productImages.map((image, index) => (
            <Image
              key={index}
              className={cn(
                'object-cover transition-opacity duration-300',
                currentImageIndex === index ? 'opacity-100' : 'opacity-0',
              )}
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ))}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-sm">
              -{product.metafield?.value}%
            </div>
          )}

          {/* Favorite Button - Always visible on mobile, on hover on desktop */}
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <FavSession
              fav={true}
              productId={product.id}
              handle={product.handle}
            />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Vendor */}
        <Link href={`/brand/${vendorToHandle(product.vendor)}`}>
          <p className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-700 transition-colors">
            {decodeHtmlEntities(product.vendor)}
          </p>
        </Link>

        {/* Title */}
        <Link href={`/product/${product.handle}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight hover:text-gray-700 transition-colors">
            {decodeHtmlEntities(product.title)}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-gray-900">
                {discountedPrice.toFixed(0)} {currencySymbol}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {originalPrice.toFixed(0)} {currencySymbol}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {originalPrice.toFixed(0)} {currencySymbol}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
