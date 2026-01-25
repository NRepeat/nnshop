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
import { SizeChartDialog } from './SizeChartDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { useLocale, useTranslations } from 'next-intl';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';

const DetailsContent = ({
  attributes,
  locale,
}: {
  attributes: ProductMEtaobjectType[];
  locale: string;
}) => {
  return (
    <div className="text-sm text-gray-600 flex flex-col gap-2">
      {attributes
        .filter(
          (attr) =>
            attr?.fields.find((f) => f.key === 'title')?.value !==
            'Особливості',
        )
        .map((attr) => {
          if (!attr) return null;
          const title =
            locale === 'ru'
              ? attr.fields.find((f) => f.key === 'ru_title')?.value
              : attr.fields.find((f) => f.key === 'title')?.value;
          const value =
            locale === 'ru'
              ? attr.fields.find((f) => f.key === 'ru_translation')?.value
              : attr.fields.find((f) => f.key === 'atribute_payload')?.value;
          if (!title || !value) return null;
          return (
            <div
              key={attr.id}
              className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 "
            >
              <span className="content-start min-w-[100px]">{title}</span>
              <span className="content-start">{value}</span>
            </div>
          );
        })}
    </div>
  );
};

import { Badge } from '@shared/ui/badge';

import { CrossedLine } from '@shared/ui/crossed-line';

const FittingGuideContent = ({
  attributes,
  locale,
}: {
  attributes: ProductMEtaobjectType[];
  locale: string;
}) => {
  const fittingAttr = attributes.find(
    (attr) =>
      attr?.fields.find((f) => f.key === 'title')?.value === 'Особливості',
  );

  if (!fittingAttr) {
    return (
      <p className="text-sm text-gray-600">
        Параметры модели и особенности посадки данного изделия.
      </p>
    );
  }

  const value =
    locale === 'ru'
      ? fittingAttr.fields.find((f) => f.key === 'ru_translation')?.value
      : fittingAttr.fields.find((f) => f.key === 'atribute_payload')?.value;

  return <p className="text-sm text-gray-600">{value}</p>;
};

export const ProductInfo = ({
  product,
  colorOptions,
  sizeOptions,
  selectedVariant,
  setSize,
  boundProduct,
  size,
  attributes,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  boundProduct: ShopifyProduct[] | undefined;
  selectedVariant: ProductVariant | undefined;
  setSize: (value: string) => void;
  size: string;
  attributes: ProductMEtaobjectType[];
}) => {
  console.log("🚀 ~ ProductInfo ~ selectedVariant:", selectedVariant)
  const t = useTranslations('ProductPage');
  const locale = useLocale();

  const sale =
    product.metafields.find((m) => m?.key === 'znizka')?.value || '0';

  const atTheFitting = selectedVariant?.metafields.find(
    (m) => m?.key === 'at_the_fitting',
  )?.value;
  console.log(selectedVariant, 'selectedVariant');
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

  const sortedSizeOptions = sizeOptions?.sort((a, b) => {
    const sizeOrder = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl'];
    const aIsNumeric = !isNaN(Number(a));
    const bIsNumeric = !isNaN(Number(b));

    if (aIsNumeric && bIsNumeric) {
      return Number(a) - Number(b);
    }

    if (!aIsNumeric && !bIsNumeric) {
      return (
        sizeOrder.indexOf(a.toLowerCase()) - sizeOrder.indexOf(b.toLowerCase())
      );
    }

    return aIsNumeric ? -1 : 1;
  });

  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start  py-0 relative w-full">
      <div className="flex flex-col gap-8 items-start  w-full max-w-2xl">
        <section className="space-y-2 w-full">
          <Link href={`/collection/${product.vendor.toLowerCase()}`}>
            <h1 className="text-xl font-semibold uppercase tracking-tight">
              {product.vendor}
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="text-lg text-gray-800">{product.title}</h2>
            {atTheFitting}
            {atTheFitting === 'true' && <Badge>{t('atTheFitting')}</Badge>}
          </div>
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
      {sortedSizeOptions && sortedSizeOptions.length > 0 && (
        <section className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-serif text-base">{t('size')}</span>
            <SizeChartDialog productType={product.productType} />
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedSizeOptions.map((s) => {
              const variant = product.variants.edges.find((edge) =>
                edge.node.selectedOptions.some(
                  (option) =>
                    option.name.toLowerCase() === 'розмір' &&
                    option.value.toLowerCase() === s.toLowerCase(),
                ),
              )?.node;
              const availableForSale = variant?.availableForSale ?? false;
              return (
                <Button
                  key={s}
                  variant={
                    size.toLowerCase() === s.toLowerCase()
                      ? 'default'
                      : 'outline'
                  }
                  className={cn('rounded-none min-w-[50px] relative', {
                    'bg-primary text-white':
                      size.toLowerCase() === s.toLowerCase(),
                  })}
                  onClick={() => setSize(s.toLowerCase())}
                  disabled={!availableForSale}
                >
                  {s}
                  {!availableForSale && <CrossedLine />}
                </Button>
              );
            })}
          </div>
        </section>
      )}
      {/* Выбор цвета */}
      {colorOptionsValues.length > 0 && (
        <section className="w-full space-y-3">
          <span className="text-sm text-gray-500 uppercase tracking-wider">
            {t('color')}
          </span>
          <div className="flex flex-wrap gap-4 mt-1">
            {colorOptionsValues.map((c) => {
              const productForColor =
                c.product === product.handle
                  ? product
                  : boundProduct?.find((p) => p.handle === c.product);
              const availableForSale =
                productForColor?.variants.edges.some(
                  (edge) => edge.node.availableForSale,
                ) ?? false;
              return (
                <Link
                  key={c.name}
                  href={`/product/${c.product}`}
                  className={cn('group', {
                    'pointer-events-none opacity-50': !availableForSale,
                  })}
                >
                  <div
                    className={cn(
                      ' border p-1 transition-all rounded-none flex justify-center items-center',
                      c.product === product.handle
                        ? 'border-black'
                        : ' border-gray-200 group-hover:border-gray-300',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-none',
                        COLOR_MAP[c.name] || 'bg-gray-200',
                      )}
                      title={c.name}
                    />
                  </div>
                </Link>
              );
            })}
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
        <AddToCartButton
          product={product}
          variant="default"
          selectedVariant={selectedVariant}
        />
        <Button
          variant="secondary"
          className="w-full h-10 md:h-14 text-md rounded-none"
        >
          {t('quickOrder')}
        </Button>
      </div>
      {/* Аккордеон деталей */}
      <Accordion type="single" collapsible className="w-full border-t mt-4">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm uppercase">
            {t('details')}
          </AccordionTrigger>
          <AccordionContent>
            <DetailsContent attributes={attributes} locale={locale} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fit">
          <AccordionTrigger className="text-sm uppercase">
            {t('fitDetails')}
          </AccordionTrigger>
          <AccordionContent>
            <FittingGuideContent attributes={attributes} locale={locale} />
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="care">
          <AccordionTrigger className="text-sm uppercase">
            {t('fabricationAndCare')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            Рекомендации по уходу: только ручная стирка, не отбеливать.
          </AccordionContent>
        </AccordionItem> */}

        <AccordionItem value="shipping">
          <AccordionTrigger className="text-sm uppercase">
            {t('shippingAndReturns')}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            <div
              dangerouslySetInnerHTML={{
                __html: t.raw('shippingAndReturnsContent'),
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
