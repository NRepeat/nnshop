import { Product } from '@shared/lib/shopify/types/storefront.types';
import Image from 'next/image';
import Link from 'next/link';
import getSymbolFromCurrency from 'currency-symbol-map';
import { cn } from '@shared/lib/utils';
import { PlusIcon } from 'lucide-react';

type ProductCardSPPProps = {
  product: Product;
  className?: string;
};

export const ProductCardSPP = ({ product, className }: ProductCardSPPProps) => {
  const { url: imageUrl, altText } = product.featuredImage || {};
  const imageAlt = altText || product.title;

  const priceAmount = parseFloat(product.priceRange.maxVariantPrice.amount);
  const currencyCode = product.priceRange.maxVariantPrice.currencyCode;
  const currencySymbol = getSymbolFromCurrency(currencyCode) || currencyCode;

  const discountMeta = Array.isArray(product.metafields)
    ? product.metafields.find((m) => m?.key === 'znizka')
    : (product as any).metafield?.key === 'znizka'
      ? (product as any).metafield
      : null;

  const discountValue = discountMeta ? parseFloat(discountMeta.value) : 0;
  const hasDiscount = discountValue > 0;
  const discountedPrice = priceAmount * (1 - discountValue / 100);

  return (
    <div className={cn('group flex flex-col gap-3 w-full', className)}>
      {/* Контейнер изображения */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <Link
          href={`/product/${product.handle}`}
          className="block h-full w-full"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}
        </Link>

        <div className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex size-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
            <PlusIcon className="size-4 text-black" />
          </div>
        </div>
      </div>

      {/* Инфо-блок */}
      <div className="flex flex-col gap-1 px-1">
        <Link href={`/product/${product.handle}`} className="hover:underline">
          <h3 className="line-clamp-2 text-[13px] leading-tight text-black">
            {product.title}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-red-600">
                {discountedPrice.toFixed(0)} {currencySymbol}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {priceAmount.toFixed(0)} {currencySymbol}
              </span>
              <span className="bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                -{discountValue}%
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">
              {priceAmount.toFixed(0)} {currencySymbol}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
