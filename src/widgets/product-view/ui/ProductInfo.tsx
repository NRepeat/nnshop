'use client';
import {
  Product as ShopifyProduct,
  ProductVariant,
} from '@shared/lib/shopify/types/storefront.types';
import { Button } from '@shared/ui/button';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';
import { cn } from '@shared/lib/utils';
import { Link } from '@shared/i18n/navigation';
import { ProductPrice } from './Price';
import { COLOR_MAP } from './collors';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { useTranslations } from 'next-intl';

export const ProductInfo = ({
  product,
  colorOptions,
  sizeOptions,
  selectedVariant,
  setSize,
  boundProduct,
  size,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  boundProduct: ShopifyProduct[] | undefined;
  selectedVariant: ProductVariant | undefined;
  setSize: (value: string) => void;
  size: string;
}) => {
  const t = useTranslations('ProductPage');

  const sale =
    product.metafields.find((m) => m?.key === 'znizka')?.value || '0';

  const colorOptionsValues = [
    ...(colorOptions?.map((name) => ({ name, product: product.handle })) || []),
    ...(boundProduct?.flatMap(
      (p) =>
        p.options
          .find((o) => o.name === 'Колір')
          ?.optionValues.map((v) => ({ name: v.name, product: p.handle })) ||
        [],
    ) || []),
  ];
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start  py-0 relative w-full">
      <div className="flex flex-col gap-8 items-start  w-full max-w-2xl">
        <section className="space-y-2 w-full">
          <Link href={`/collection/${product.vendor.toLowerCase()}`}>
            <h1 className="text-xl font-semibold uppercase tracking-tight">
              {product.vendor}
            </h1>
          </Link>
          <h2 className="text-lg text-gray-800">{product.title}</h2>
          {selectedVariant?.sku && (
            <p className="text-sm text-gray-500">
              Артикул: {selectedVariant.sku}
            </p>
          )}
          <ProductPrice
            product={product}
            selectedVariant={selectedVariant}
            sale={sale}
          />
        </section>
      </div>
      {/* Выбор размера */}
      {sizeOptions && sizeOptions.length > 0 && (
        <section className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-serif text-base">{t('size')}</span>
            <Button variant="link" className="p-0 h-auto text-sm underline">
              {t('sizeChart')}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <Button
                key={s}
                variant={
                  size.toLowerCase() === s.toLowerCase() ? 'default' : 'outline'
                }
                className={cn('rounded-none min-w-[50px]', {
                  'bg-primary text-white':
                    size.toLowerCase() === s.toLowerCase(),
                })}
                onClick={() => setSize(s.toLowerCase())}
              >
                {s}
              </Button>
            ))}
          </div>
        </section>
      )}
      {/* Выбор цвета */}
      {colorOptionsValues.length > 0 && (
        <section className="w-full space-y-3">
          <span className="text-sm text-gray-500 uppercase tracking-wider">
            {t('color')}
          </span>
          <div className="flex flex-wrap gap-4">
            {colorOptionsValues.map((c) => (
              <Link
                key={c.name}
                href={`/product/${c.product}`}
                className="group"
              >
                <div
                  className={cn(
                    'size-9 border p-0.5 transition-all',
                    c.product === product.handle
                      ? 'border-black'
                      : 'border-transparent group-hover:border-gray-300',
                  )}
                >
                  <div
                    className={cn(
                      'w-full h-full',
                      COLOR_MAP[c.name] || 'bg-gray-200',
                    )}
                    title={c.name}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {product.descriptionHtml && (
        <div
          className="text-sm leading-relaxed text-gray-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      )}
      <div className="flex gap-4 flex-nowrap flex-col w-full">
        <AddToCartButton product={product} variant="default" />
        <Button
          variant="secondary"
          className="w-full h-10 md:h-14 text-md rounded-none"
        >
          {t('quickOrder')}
        </Button>
      </div>
      {/* Аккордеон деталей */}
      <Accordion type="single" collapsible className="w-full border-t mt-4">
        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm uppercase">
            {t('checkInStoreAvailability')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            {/* Контент для наличия */}
            Информация о наличии товара в магазинах вашего города.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fit">
          <AccordionTrigger className="text-sm uppercase">
            {t('fitDetails')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            Параметры модели и особенности посадки данного изделия.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="care">
          <AccordionTrigger className="text-sm uppercase">
            {t('fabricationAndCare')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            {/* Здесь можно вывести данные из метаполей о составе */}
            Рекомендации по уходу: только ручная стирка, не отбеливать.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping">
          <AccordionTrigger className="text-sm uppercase">
            {t('shippingAndReturns')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            Бесплатная доставка при заказе от 5000 грн. Возврат в течение 14
            дней.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
