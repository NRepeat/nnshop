'use client';
import Image from 'next/image';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { CommandItem } from '@shared/ui/command';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';

type Props = {
  product: Product;
  onSelect: (product: Product) => void;
};

export function SearchCommandRow({ product, onSelect }: Props) {
  const imgUrl = product.featuredImage?.url;
  const alt = product.featuredImage?.altText || product.title;

  const priceAmount = parseFloat(
    product.priceRange?.maxVariantPrice?.amount ?? '0',
  );
  const currencyCode = product.priceRange?.maxVariantPrice?.currencyCode;
  const currencySymbol = getCurrencySymbol(currencyCode);

  const discountMeta = Array.isArray(product.metafields)
    ? product.metafields.find((m) => m?.key === DISCOUNT_METAFIELD_KEY)
    : (product as unknown as { metafield?: { key?: string; value?: string } })
          .metafield?.key === DISCOUNT_METAFIELD_KEY
      ? (product as unknown as { metafield?: { key?: string; value?: string } })
          .metafield
      : null;

  const discountValue = discountMeta?.value ? parseFloat(discountMeta.value) : 0;
  const hasDiscount = discountValue > 0;
  const discountedPrice = priceAmount * (1 - discountValue / 100);

  return (
    <CommandItem
      value={`${product.title}-${product.id}`}
      onSelect={() => onSelect(product)}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div className="relative w-10 h-10 shrink-0 bg-neutral-100 overflow-hidden rounded">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={alt}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : null}
      </div>
      <span className="flex-1 truncate text-sm">
        {decodeHtmlEntities(product.title)}
      </span>
      <span className="text-sm tabular-nums shrink-0">
        {hasDiscount ? (
          <>
            <span className="line-through text-neutral-400 mr-1">
              {priceAmount.toFixed(0)} {currencySymbol}
            </span>
            <span className="text-red-600 font-medium">
              {discountedPrice.toFixed(0)} {currencySymbol}
            </span>
          </>
        ) : (
          <>
            {priceAmount.toFixed(0)} {currencySymbol}
          </>
        )}
      </span>
    </CommandItem>
  );
}
