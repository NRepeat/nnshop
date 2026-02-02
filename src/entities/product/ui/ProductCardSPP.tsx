import { Product } from '@shared/lib/shopify/types/storefront.types';
import Image from 'next/image';
import Link from 'next/link';
import getSymbolFromCurrency from 'currency-symbol-map';
import { cn } from '@shared/lib/utils';

type ProductCardSPPProps = {
  product: Product;
  className?: string;
  link?: boolean;
};

export const ProductCardSPP = ({
  product,
  className,
  link = true,
}: ProductCardSPPProps) => {
  const { url: imageUrl, altText } = product.featuredImage || {};
  const imageAlt = altText || product.title;

  const priceAmount = parseFloat(product.priceRange?.maxVariantPrice.amount);
  const currencyCode = product.priceRange?.maxVariantPrice.currencyCode;
  const currencySymbol = getSymbolFromCurrency(currencyCode) || currencyCode;

  const discountMeta = Array.isArray(product.metafields)
    ? product.metafields.find((m) => m?.key === 'znizka')
    : (product as any).metafield?.key === 'znizka'
      ? (product as any).metafield
      : null;

  const discountValue = discountMeta ? parseFloat(discountMeta.value) : 0;
  const hasDiscount = discountValue > 0;
  const discountedPrice = priceAmount * (1 - discountValue / 100);
  const WithLink = ({ children }: { children: React.ReactNode }) => {
    if (link) {
      return (
        <Link
          prefetch
          href={`/product/${product.handle}`}
          className="block h-full w-full"
          scroll={true}
        >
          {children}
        </Link>
      );
    } else {
      return <div className="block h-full w-full">{children}</div>;
    }
  };
  return (
    <div className={cn('group flex flex-col gap-3 w-full', className)}>
      {/* Контейнер изображения */}
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-background">
        <WithLink>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}
        </WithLink>
      </div>

      {/* Инфо-блок */}
      <div className="flex flex-col gap-1 px-1">
        <Link
          href={`/product/${product.handle}`}
          className="hover:border-b hover:border-current transition-colors"
          scroll
        >
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
              <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
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
