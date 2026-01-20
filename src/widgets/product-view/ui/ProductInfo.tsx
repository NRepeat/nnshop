'use client';
import { useTranslations } from 'next-intl';
import {
  Product as ShopifyProduct,
  ProductVariant,
  ProductOption,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import getSymbolFromCurrency from 'currency-symbol-map';
import { cn } from '@shared/lib/utils';
import { Link } from '@shared/i18n/navigation';
export const colorMap: { [key: string]: string } = {
  Бежевий: 'bg-[#F5F5DC]',
  Блакитний: 'bg-[#87CEEB]',
  Бордовий: 'bg-[#800000]',
  Бронзовий: 'bg-[#CD7F32]',
  Білий: 'bg-[#FFFFFF]',
  Жовтий: 'bg-[#FFFF00]',
  Зелений: 'bg-[#008000]',
  Золото: 'bg-[#FFD700]',
  Коричневий: 'bg-[#A52A2A]',
  "М'ятний": 'bg-[#98FF98]',
  Мультиколор: 'bg-gradient-to-r from-red-500 to-blue-500',
  Помаранчевий: 'bg-[#FFA500]',
  Пітон: 'bg-gray-500',
  Рожевий: 'bg-[#FFC0CB]',
  Рудий: 'bg-[#D2691E]',
  Синій: 'bg-[#0000FF]',
  Срібло: 'bg-[#C0C0C0]',
  Сірий: 'bg-[#808080]',
  Фіолетовий: 'bg-[#8A2BE2]',
  Хакі: 'bg-[#F0E68C]',
  Червоний: 'bg-[#FF0000]',
  Чорний: 'bg-[#000000]',
};

export const ProductInfo = ({
  product,
  colorOptions,
  sizeOptions,
  selectedVariant,
  setColor,
  setSize,
  color,
  boundProduct,
  size,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  boundProduct: ShopifyProduct[] | undefined;
  selectedVariant: ProductVariant | undefined;
  setColor: (value: string) => void;
  setSize: (value: string) => void;
  color: string;
  size: string;
}) => {
  const t = useTranslations('ProductPage');
  const sale =
    product.metafields
      .filter((metafield) => metafield?.key === 'znizka')
      .find((metafield) => metafield?.value)?.value || '0';

  const boundColorOptions = boundProduct?.flatMap(
    (product) =>
      product.options.find((option) => option.name === 'Колір') || [],
  );
  const colorOptionsValues: { name: string; product: string }[] = [];
  if (colorOptions && colorOptions.length > 0) {
    colorOptionsValues.push(
      ...colorOptions.map((op) => ({ name: op, product: product.handle })),
    );
  }

  if (boundColorOptions && boundColorOptions.length > 0) {
    colorOptionsValues.push(
      ...boundColorOptions.map((op) => ({
        name: op.optionValues[0].name,
        product: boundProduct![0].handle,
      })),
    );
  }
  console.log(sizeOptions, 'sizeOptions');
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start px-[50px] py-0 relative w-full">
      {/*<p className="font-sans leading-[20px] not-italic relative shrink-0 text-[#979797] text-[13px] w-full">
        {t('shopClothing')}
      </p>*/}
      <div className="content-stretch flex flex-col font-sans gap-[8px] items-start not-italic relative shrink-0 text-black w-full">
        <p className="leading-[24px] relative shrink-0 text-xl font-semibold w-full">
          {product.vendor}
        </p>
        <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
          {product.title}
        </p>
        <div className="w-full  flex flex-col gap-1 flex-1 ">
          <div className="flex flex-col justify-between flex-1">
            <div className="mt-auto">
              {Number(sale) !== 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="line-through text-gray-500 text-sm">
                    {parseFloat(
                      product.priceRange.maxVariantPrice.amount,
                    ).toFixed(0)}{' '}
                    {getSymbolFromCurrency(
                      product.priceRange.maxVariantPrice.currencyCode,
                    ) || product.priceRange.maxVariantPrice.currencyCode}
                  </span>

                  <span className="text-red-600 font-bold text-lg">
                    {(
                      product.priceRange.maxVariantPrice.amount *
                      (1 - parseFloat(sale) / 100)
                    ).toFixed(0)}{' '}
                    {getSymbolFromCurrency(
                      product.priceRange.maxVariantPrice.currencyCode,
                    ) || product.priceRange.maxVariantPrice.currencyCode}
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                    -{sale}%
                  </span>
                </div>
              ) : (
                <span className="font-bold text-lg">
                  {parseFloat(
                    product.priceRange.maxVariantPrice.amount,
                  ).toFixed(0)}{' '}
                  {getSymbolFromCurrency(
                    product.priceRange.maxVariantPrice.currencyCode,
                  ) || product.priceRange.maxVariantPrice.currencyCode}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-auto">
          {selectedVariant?.compareAtPrice && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="line-through text-gray-500 text-xs">
                {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(0)}
                {getSymbolFromCurrency(
                  selectedVariant.compareAtPrice.currencyCode,
                ) || selectedVariant.compareAtPrice.currencyCode}
              </span>

              <span className="text-red-600 font-bold text-sm">
                {parseFloat(selectedVariant.price.amount).toFixed(0)}{' '}
                {getSymbolFromCurrency(selectedVariant.price.currencyCode) ||
                  selectedVariant.price.currencyCode}
              </span>

              <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">
                -
                {(
                  (1 -
                    parseFloat(selectedVariant.price.amount) /
                      parseFloat(selectedVariant.compareAtPrice.amount)) *
                  100
                ).toFixed(0)}
                %
              </span>
            </div>
          )}
          {!selectedVariant?.compareAtPrice && selectedVariant?.price && (
            <span className="font-bold text-sm">
              {parseFloat(selectedVariant.price.amount).toFixed(0)}{' '}
              {getSymbolFromCurrency(selectedVariant.price.currencyCode) ||
                selectedVariant.price.currencyCode}
            </span>
          )}
        </div>
      </div>
      {sizeOptions && sizeOptions.length > 0 && (
        <>
          <div className="flex gap-4 items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex  justify-between leading-[20px] not-italic relative shrink-0 text-base text-black text-nowrap w-full items-center">
                <p className="font-serif relative shrink-0">
                  {t('productSize')}
                </p>
                <Button className="p-0" variant={'link'}>
                  <p className="[text-decoration-skip-ink:none] text-sm [text-underline-position:from-font] decoration-solid font-sans relative shrink-0 text-right underline">
                    {t('sizeChart')}
                  </p>
                </Button>
              </div>
              <div className="content-stretch flex gap-2 leading-[20px] not-italic relative shrink-0 text-base text-black text-nowrap w-full items-center">
                {sizeOptions &&
                  sizeOptions.map((s: string) => (
                    <Button
                      key={s}
                      variant={
                        size.toLowerCase() === s.toLowerCase()
                          ? 'default'
                          : 'outline'
                      }
                      className={cn('rounded-none', {
                        'bg-black text-white':
                          size.toLowerCase() === s.toLowerCase(),
                      })}
                      onClick={() => setSize(s.toLowerCase())}
                    >
                      {s}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {product.descriptionHtml && (
        <p
          className="font-sans leading-[20px] not-italic relative shrink-0 text-[14px] text-black w-full"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        ></p>
      )}
      {colorOptions && colorOptions.length > 0 && (
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
          <p className="font-sans leading-[20px] not-italic relative shrink-0 text-[#565656] text-[13px] w-full">
            {t('color')}
          </p>
          <div className="flex gap-[20px] items-center relative shrink-0 w-full">
            {colorOptionsValues &&
              colorOptionsValues.length > 0 &&
              colorOptionsValues.map((c, i) => (
                <Link href={`/product/${c.product}`} className="flex">
                  <div
                    className={cn(
                      'relative shrink-0 size-[32px] border border-muted',
                      { 'border-[#565656]': i === 0 },
                    )}
                    key={c.name}
                    // onClick={() => setColor(c.name.toLowerCase())}
                  >
                    <div
                      className={cn('absolute inset-[10%]', {
                        [`${colorMap[c.name]}`]: colorMap[c.name],
                      })}
                    ></div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      <AddToCartButton product={product} variant="default" />
      {/*<div className="bg-black content-stretch flex items-center justify-center px-[18px] py-[11px] relative shrink-0 w-full">
      <p className="font-sans leading-[20px] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
        Add to Bag
      </p>
    </div>*/}
      <div className="content-stretch flex flex-col gap-px items-start relative shrink-0 w-full">
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('checkInStoreAvailability')}
          </p>
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fitDetails')}
          </p>
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fabricationAndCare')}
          </p>
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('shippingAndReturns')}
          </p>
        </div>
      </div>
    </div>
  );
};
