import {
  Product as ShopifyProduct,
  ProductVariant,
} from '@shared/lib/shopify/types/storefront.types';
import getSymbolFromCurrency from 'currency-symbol-map';

// --- Подкомпонент Цены ---
export const ProductPrice = ({
  product,
  selectedVariant,
  sale,
}: {
  product: ShopifyProduct;
  selectedVariant?: ProductVariant;
  sale: string;
}) => {
  const displayPrice =
    selectedVariant?.price || product.priceRange.maxVariantPrice;
  const comparePrice = selectedVariant?.compareAtPrice;
  const currency =
    getSymbolFromCurrency(displayPrice.currencyCode) ||
    displayPrice.currencyCode;

  return (
    <div className="flex flex-col gap-1">
      {comparePrice || Number(sale) > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="line-through text-gray-500 text-sm">
            {parseFloat(
              comparePrice?.amount || product.priceRange.maxVariantPrice.amount,
            ).toFixed(0)}{' '}
            {currency}
          </span>
          <span className="text-red-600 font-bold text-lg">
            {parseFloat(displayPrice.amount).toFixed(0)} {currency}
          </span>
          <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
            -{sale}%
          </span>
        </div>
      ) : (
        <span className="font-bold text-lg">
          {parseFloat(displayPrice.amount).toFixed(0)} {currency}
        </span>
      )}
    </div>
  );
};
