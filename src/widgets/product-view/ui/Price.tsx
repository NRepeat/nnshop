import {
  Product as ShopifyProduct,
  ProductVariant,
} from '@shared/lib/shopify/types/storefront.types';
import getSymbolFromCurrency from 'currency-symbol-map';

export const ProductPrice = ({
  product,
  selectedVariant,
  sale,
}: {
  product: ShopifyProduct;
  selectedVariant?: ProductVariant;
  sale: string;
}) => {
  // Базовая цена (берем либо вариант, либо из диапазона продукта)
  const basePriceObj =
    selectedVariant?.price || product.priceRange.maxVariantPrice;
  const comparePriceObj = selectedVariant?.compareAtPrice;

  const baseAmount = parseFloat(basePriceObj.amount);
  const discountPercent = parseFloat(sale) || 0;

  // Логика перерасчета:
  // 1. Если передана sale (> 0), считаем финальную цену от базовой
  // 2. Если sale нет, проверяем наличие compareAtPrice (стандартная скидка Shopify)

  let finalPrice: number;
  let strikethroughPrice: number | null = null;

  if (discountPercent > 0) {
    finalPrice = baseAmount * (1 - discountPercent / 100);
    strikethroughPrice = baseAmount;
  } else if (
    comparePriceObj &&
    parseFloat(comparePriceObj.amount) > baseAmount
  ) {
    finalPrice = baseAmount;
    strikethroughPrice = parseFloat(comparePriceObj.amount);
  } else {
    finalPrice = baseAmount;
  }

  const currency =
    getSymbolFromCurrency(basePriceObj.currencyCode) ||
    basePriceObj.currencyCode;

  return (
    <div className="flex flex-col gap-1">
      {strikethroughPrice ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="line-through text-gray-500 text-sm">
            {strikethroughPrice.toFixed(0)} {currency}
          </span>
          <span className="text-red-600 font-bold text-lg">
            {finalPrice.toFixed(0)} {currency}
          </span>
          <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
            -
            {discountPercent > 0
              ? discountPercent
              : Math.round(100 - (finalPrice / strikethroughPrice) * 100)}
            %
          </span>
        </div>
      ) : (
        <span className="font-bold text-lg">
          {finalPrice.toFixed(0)} {currency}
        </span>
      )}
    </div>
  );
};
