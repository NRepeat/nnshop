import { getTranslations } from 'next-intl/server';
import Gallery from '@features/product/ui/Gallery';
import {
  ProductVariant,
  Product as ShopifyProduct,
} from '@shared/lib/shopify/types/storefront.types';
import { PAGE_QUERYResult } from '@shared/sanity/types';
import { Session, User } from 'better-auth';
import Link from 'next/link';
import { ProductCardSPP } from '@entities/product/ui/ProductCardSPP';
import { cn } from '@shared/lib/utils';
import { Plus } from '@shared/ui/PlusIcon';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import ProductComments from '@entities/product/ui/ProductComments';

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

const ProductInfo = async ({
  product,
  colorOptions,
  sizeOptions,
  locale,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  locale: string;
}) => {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start px-[50px] py-0 relative w-full">
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#979797] text-[13px] w-full">
        {t('shopClothing')}
      </p>
      <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[8px] items-start not-italic relative shrink-0 text-black w-full">
        <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
          {product.title}
        </p>
        <p className="leading-[22px] relative shrink-0 text-[16px] w-full">
          {product.priceRange.maxVariantPrice.currencyCode}
          {Number(product.priceRange.maxVariantPrice.amount).toFixed(0)}
        </p>
      </div>
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex items-start justify-between leading-[20px] not-italic relative shrink-0 text-[13px] text-black text-nowrap w-full">
          <p className="font-['Styrene_A_Web:Medium',sans-serif] relative shrink-0">
            {t('productSize')}
          </p>
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Styrene_A_Web:Regular',sans-serif] relative shrink-0 text-right underline">
            {t('sizeChart')}
          </p>
        </div>
        <div className="flex gap-4 items-center relative shrink-0 w-full">
          {sizeOptions &&
            sizeOptions.map((size: string) => (
              <Button key={size} variant="outline" className="rounded-none">
                {size}
              </Button>
            ))}
        </div>
      </div>
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
        {product.description}
      </p>
      <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
        <div className="content-stretch flex gap-[2px] items-start leading-[20px] not-italic relative shrink-0 text-[13px] text-black w-full">
          <p className="font-['Styrene_A_Web:Medium',sans-serif] relative shrink-0 text-nowrap">
            {t('productColor')}
          </p>
          {/*<p className="font-['Styrene_A_Web:Regular',sans-serif] relative shrink-0 w-[66px]">
          {selectedVariant?.title.split(' / ')[1]}
        </p>*/}
        </div>
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#565656] text-[13px] w-full">
          {t('color')}
        </p>
        <div className="grid grid-cols-2 gap-[20px] items-center relative shrink-0 w-full">
          {colorOptions &&
            colorOptions.map((color: string) => (
              <div className="relative shrink-0 size-[32px]" key={color}>
                <div
                  className="absolute inset-[10%]"
                  style={{ backgroundColor: colorMap[color] }}
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
      <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[15px] text-nowrap text-white">
        Add to Bag
      </p>
    </div>*/}
      <div className="content-stretch flex flex-col gap-px items-start relative shrink-0 w-full">
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('checkInStoreAvailability')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fitDetails')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('fabricationAndCare')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
        <div className="border-[#ddd] border-[0px_0px_1px] border-solid content-stretch flex gap-[10px] items-center px-0 py-[13px] relative shrink-0 w-full">
          <p className="basis-0 font-['Styrene_A_Web:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[13px] text-black">
            {t('shippingAndReturns')}
          </p>
          <CaretDown className="overflow-clip relative shrink-0 size-[20px]" />
        </div>
      </div>
    </div>
  );
};
const ProductDetails = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  return (
    <div className="border-[#ddd] border-y border-solid content-stretch flex gap-[72px] items-start px-[115px] py-[67px] w-full">
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('design')}
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('airyAndWarm')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('airyAndWarmDescription')}
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('quality')}
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('madeInItaly')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('madeInItalyDescription')}
          </p>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col gap-[26px] grow items-start min-h-px min-w-px relative shrink-0">
        <p className="font-['Styrene_A_Web:Light',sans-serif] leading-[20px] not-italic relative shrink-0 text-[13px] text-black tracking-[0.7px] uppercase w-full">
          {t('sustainability')}
        </p>
        <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[18px] items-start not-italic relative shrink-0 text-black w-full">
          <p className="leading-[24px] relative shrink-0 text-[18px] w-full">
            {t('sustainableBabyAlpaca')}
          </p>
          <p className="leading-[20px] relative shrink-0 text-[13px] w-full">
            {t('sustainableBabyAlpacaDescription')}
          </p>
        </div>
      </div>
    </div>
  );
};

const ElegantEase = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  const imgImage =
    'http://localhost:3845/assets/3273dd356ee24e8d6046a3d53e72f5b4bffef30d.png';
  const imgImage1 =
    'http://localhost:3845/assets/e35105eb5d505cdd4960368b76fe346424d9cf62.png';

  return (
    <div className="content-stretch flex flex-col gap-[48px] items-center relative w-full">
      <div className="content-stretch flex flex-col font-['Styrene_A_Web:Regular',sans-serif] gap-[16px] items-center not-italic px-0 py-[20px] relative shrink-0 text-black text-center w-full">
        <p className="leading-[32px] relative shrink-0 text-[24px] w-full">
          {t('elegantEase')}
        </p>
        <p className="leading-[22px] relative shrink-0 text-[16px] w-full">
          {t('elegantEaseDescription')}
        </p>
      </div>
      <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-full">
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute h-[158.76%] left-[-4.08%] max-w-none top-[-57.06%] w-[162.24%]"
              src={imgImage}
            />
          </div>
        </div>
        <div className="basis-0 grow h-[652px] min-h-px min-w-px relative shrink-0">
          <img
            alt=""
            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
            src={imgImage1}
          />
        </div>
      </div>
    </div>
  );
};

export async function ProductView({
  product,
  relatedProducts,
  locale,
}: {
  product: ShopifyProduct;
  relatedProducts: ShopifyProduct[];
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: 'ProductPage' });
  if (!product) throw new Error('Product not found');
  const images = product.images.edges.map((edge) => edge.node).filter(Boolean);
  const colorOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Колір'.toLowerCase(),
  )?.values;
  const sizeOptions = product.options.find(
    (option) => option.name.toLowerCase() === 'Розмір'.toLowerCase(),
  )?.values;
  return (
    <div className="container mx-auto py-12 space-y-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Gallery images={images} productId={product.id} isFavorite={false} />
        <ProductInfo
          product={product}
          colorOptions={colorOptions}
          sizeOptions={sizeOptions}
          locale={locale}
        />
      </div>
      <ProductDetails locale={locale} />
      <ElegantEase locale={locale} />
      <div className="content-stretch flex flex-col gap-[70px] items-center px-0 py-[74px] relative w-full">
        <p className="font-['Styrene_A_Web:Regular',sans-serif] leading-[26px] not-italic relative shrink-0 text-[20px] text-black text-center w-full">
          {t('styleWith')}
        </p>
        <div className="content-stretch flex gap-[20px] items-start px-[153px] py-0 relative shrink-0 w-full">
          {relatedProducts.slice(0, 3).map((p) => (
            <ProductCardSPP product={p} key={p.id} />
          ))}
        </div>
      </div>
      <ProductComments />
    </div>
  );
}
