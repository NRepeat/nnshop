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

import { compareSizes } from '@shared/lib/sort-sizes';
import { QuickBuyModal } from '@features/product/quick-buy/ui/QuickBuyModal';
import { PriceSubscribeModal } from '@features/product/ui/PriceSubscribeModal';
import { useState } from 'react';
import { Badge } from '@shared/ui/badge';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { Bell } from 'lucide-react';

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
  const t = useTranslations('ProductPage');
  const locale = useLocale();
  const [isQuickBuyOpen, setQuickBuyOpen] = useState(false);
  const [isPriceSubscribeOpen, setPriceSubscribeOpen] = useState(false);

  const sale =
    product.metafields.find((m) => m?.key === 'znizka')?.value || '0';
  const sku = product.variants.edges[0].node.sku;
  const isAtFitting =
    selectedVariant?.currentlyNotInStock === false &&
    selectedVariant?.quantityAvailable === 0;
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

  const sortedSizeOptions = sizeOptions?.slice().sort(compareSizes);
  const cleanHtml = product.descriptionHtml.replace(/style="[^"]*"/gi, '');
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start  py-0 relative w-full">
      <div className="flex flex-col gap-8 items-start  w-full max-w-2xl">
        <section className="space-y-2 w-full">
          {product.vendor && (
            <Link href={`/brand/${vendorToHandle(product.vendor)}`} prefetch>
              <p className="text-xl font-semibold uppercase tracking-tight">
                {product.vendor}
              </p>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-lg text-gray-800">{product.title}</h1>
            {isAtFitting && <Badge>{t('atTheFitting')}</Badge>}
          </div>
          {sku && (
            <p className="text-sm text-gray-500">
              {t('sku')}: {sku}
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
              const qty = variant?.quantityAvailable ?? -1;
              const isZeroQty = qty === 0;
              const variantAtFitting = variant?.currentlyNotInStock === false && isZeroQty;
              // Zero-qty variants stay clickable (badge shows on select, cart disabled separately)
              // Only variants unavailable for other reasons get disabled
              const isUnavailable = !availableForSale && !isZeroQty;
              const showCrossed = isUnavailable || (isZeroQty && !variantAtFitting);
              const showMuted = isUnavailable || isZeroQty;
              return (
                <Button
                  key={s}
                  variant={
                    size.toLowerCase() === s.toLowerCase()
                      ? 'default'
                      : 'outline'
                  }
                  className={cn(
                    'rounded-md min-w-[56px] h-11 text-sm font-medium relative border-primary border',
                    {
                      'bg-primary text-white ring-2 ring-offset-1 ring-primary ':
                        size.toLowerCase() === s.toLowerCase(),
                      'opacity-40': showMuted && size.toLowerCase() !== s.toLowerCase(),
                    },
                  )}
                  onClick={() => setSize(s.toLowerCase())}
                  disabled={isUnavailable}
                >
                  {s}
                  {showCrossed && <CrossedLine />}
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
                  prefetch
                  key={c.name}
                  href={`/product/${c.product}`}
                  className={cn('group', {
                    'pointer-events-none opacity-50': !availableForSale,
                  })}
                >
                  <div
                    className={cn(
                      ' border p-1 transition-all rounded-md flex justify-center items-center',
                      c.product === product.handle
                        ? 'border-black'
                        : ' border-gray-200 group-hover:border-gray-300',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md',
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
          className="text-md font-sans leading-relaxed text-gray-700 prose prose-md max-w-none"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      )}
      <div className="flex gap-4 flex-nowrap flex-col w-full">
        {sortedSizeOptions && sortedSizeOptions.length > 0 ? (
          <AddToCartButton
            product={product}
            variant="default"
            selectedVariant={selectedVariant}
          />
        ) : (
          <AddToCartButton
            product={product}
            variant="default"
            selectedVariant={product.variants.edges[0].node}
          />
        )}

        <Button
          variant="secondary"
          className="w-full h-10 md:h-14 text-md rounded-md"
          onClick={() => setQuickBuyOpen(true)}
        >
          {t('quickOrder')}
        </Button>
        <Button
          variant="outline"
          className="w-full h-10 md:h-12 text-sm rounded-md flex items-center gap-2"
          onClick={() => setPriceSubscribeOpen(true)}
        >
          <Bell className="w-4 h-4" />
          {t('priceSubscribeButton')}
        </Button>
      </div>
      <QuickBuyModal
        product={product}
        open={isQuickBuyOpen}
        onOpenChange={setQuickBuyOpen}
        sizeOptions={sizeOptions}
      />
      <PriceSubscribeModal
        open={isPriceSubscribeOpen}
        onOpenChange={setPriceSubscribeOpen}
        shopifyProductId={product.id}
        shopifyVariantId={selectedVariant?.id}
      />
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

        {/* <AccordionItem value="fit">
          <AccordionTrigger className="text-sm uppercase">
            {t('fitDetails')}
          </AccordionTrigger>
          <AccordionContent>
            <FittingGuideContent attributes={attributes} locale={locale} />
          </AccordionContent>
        </AccordionItem> */}

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
