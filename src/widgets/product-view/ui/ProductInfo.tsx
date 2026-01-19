'use client';
import { useTranslations } from 'next-intl';
import {
  Product as ShopifyProduct,
  ProductVariant,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import getSymbolFromCurrency from 'currency-symbol-map';

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
const imgCaretDown =
  'http://localhost:3845/assets/2ebf1b4d037f823ffce000f6c3337e8e5e87221b.svg';
const imgVector =
  'http://localhost:3845/assets/9d8694519d22fdb942473bb6bb3d1f5e4e9efe43.svg';
function CaretDown({ className }: { className?: string }) {
  return (
    <div className={className}>
      <img alt="" className="block max-w-none size-full" src={imgCaretDown} />
      <div className="absolute inset-[37.5%_18.75%_31.25%_18.75%]">
        <div className="absolute inset-[-6.67%_-3.33%]">
          <img alt="" className="block max-w-none size-full" src={imgVector} />
        </div>
      </div>
    </div>
  );
}
export const ProductInfo = ({
  product,
  colorOptions,
  sizeOptions,
  selectedVariant,
  setColor,
  setSize,
  color,
  size,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  selectedVariant: ProductVariant | undefined;
  setColor: (value: string) => void;
  setSize: (value: string) => void;
  color: string;
  size: string;
}) => {
  const t = useTranslations('ProductPage');
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start px-[50px] py-0 relative w-full">
      <p className="font-sans leading-[20px] not-italic relative shrink-0 text-[#979797] text-[13px] w-full">
        {t('shopClothing')}
      </p>
      <div className="content-stretch flex flex-col font-sans gap-[8px] items-start not-italic relative shrink-0 text-black w-full">
        <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
          {product.title}
        </p>
        <div className="mt-auto">
          {selectedVariant?.compareAtPrice && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="line-through text-gray-500 text-xs">
                {parseFloat(selectedVariant.compareAtPrice.amount).toFixed(0)}{' '}
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
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex items-start justify-between leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-nowrap w-full">
          <p className="font-['Styrene_A_Web:Medium',sans-serif] relative shrink-0">
            {t('productSize')}
          </p>
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-sans relative shrink-0 text-right underline">
            {t('sizeChart')}
          </p>
        </div>
        <div className="flex gap-4 items-center relative shrink-0 w-full">
          {sizeOptions &&
            sizeOptions.map((s: string) => (
              <Button
                key={s}
                variant={
                  size.toLowerCase() === s.toLowerCase() ? 'default' : 'outline'
                }
                className="rounded-none"
                onClick={() => setSize(s.toLowerCase())}
              >
                {s}
              </Button>
            ))}
        </div>
      </div>
      <p
        className="font-sans leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full"
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      ></p>
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        <p className="font-sans leading-[20px] not-italic relative shrink-0 text-[#565656] text-[13px] w-full">
          {t('color')}
        </p>
        <div className="grid grid-cols-2 gap-[20px] items-center relative shrink-0 w-full">
          {colorOptions &&
            colorOptions.map((c: string) => (
              <div
                className="relative shrink-0 size-[32px]"
                key={c}
                onClick={() => setColor(c.toLowerCase())}
              >
                <div
                  className="absolute inset-[10%]"
                  style={{ backgroundColor: colorMap[c] }}
                ></div>
                <div className="absolute inset-[-1.56%]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    src="http://localhost:3845/assets/7b6e69fa820e8157eb187c09e4e2076f8a5db102.svg"
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      <AddToCartButton product={product} />
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
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fitDetails')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fabricationAndCare')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-sans grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('shippingAndReturns')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
      </div>
    </div>
  );
};
