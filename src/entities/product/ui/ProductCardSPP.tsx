import { Product } from '@shared/lib/shopify/types/storefront.types';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from '@shared/ui/PlusIcon';
import getSymbolFromCurrency from 'currency-symbol-map';

type ProductCardSPPProps = {
  product: Product;
};

export const ProductCardSPP = ({ product }: ProductCardSPPProps) => {
  const imageUrl = product.featuredImage?.url;
  const imageAlt = product.featuredImage?.altText || product.title;
  const imageWidth = product.featuredImage?.width || 300;
  const imageHeight = product.featuredImage?.height || 300;

  return (
    <div className="basis-0 content-stretch flex flex-col gap-[13px] grow h-[438px] items-start min-h-px min-w-px relative shrink-0">
      <div className="basis-0 content-stretch flex gap-[10px] grow items-start min-h-px min-w-px relative shrink-0 w-full">
        <Link
          href={`/product/${product.handle}`}
          className="basis-0 grow h-full min-h-px min-w-px relative shrink-0"
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={imageWidth}
              height={imageHeight}
              className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
            />
          )}
        </Link>
        <div className="absolute bottom-0 content-stretch flex items-end justify-end left-0 p-[15px] right-0">
          <Plus className="overflow-clip relative shrink-0 size-[18px]" />
        </div>
      </div>
      <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[3px] items-start leading-[20px] not-italic pb-[13px] pt-0 px-0 relative shrink-0 text-[13px] text-black w-full">
        <Link href={`/product/${product.handle}`}>
          <p className="relative shrink-0 w-full">{product.title}</p>
        </Link>
        <div className="mt-auto">
          {product.metafield &&
          product.metafield.key === 'znizka' &&
          Number(product.metafield.value) !== 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="line-through text-gray-500 text-xs">
                {parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(
                  0,
                )}{' '}
                {getSymbolFromCurrency(
                  product.priceRange.maxVariantPrice.currencyCode,
                ) || product.priceRange.maxVariantPrice.currencyCode}
              </span>

              <span className="text-red-600 font-bold text-sm">
                {(
                  product.priceRange.maxVariantPrice.amount *
                  (1 - parseFloat(product.metafield.value) / 100)
                ).toFixed(0)}{' '}
                {getSymbolFromCurrency(
                  product.priceRange.maxVariantPrice.currencyCode,
                ) || product.priceRange.maxVariantPrice.currencyCode}
              </span>

              <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                -{product.metafield.value}%
              </span>
            </div>
          ) : (
            <span className="font-bold text-sm">
              {parseFloat(product.priceRange.maxVariantPrice.amount).toFixed(0)}{' '}
              {getSymbolFromCurrency(
                product.priceRange.maxVariantPrice.currencyCode,
              ) || product.priceRange.maxVariantPrice.currencyCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
