'use client';
import React from 'react';
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
import dynamic from 'next/dynamic';
const SizeChartDialog = dynamic(
  () => import('./SizeChartDialog').then((m) => m.SizeChartDialog),
  { ssr: false },
);
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { useLocale, useTranslations } from 'next-intl';
import { ProductMEtaobjectType } from '@entities/metaobject/api/get-metaobject';

import { CrossedLine } from '@shared/ui/crossed-line';
import { compareSizes } from '@shared/lib/sort-sizes';
import { QuickBuyModal } from '@features/product/quick-buy/ui/QuickBuyModal';
import { PriceSubscribeModal } from '@features/product/ui/PriceSubscribeModal';
import { useState, useRef, useEffect, useMemo, useTransition } from 'react';
import { vendorToHandle } from '@shared/lib/utils/vendorToHandle';
import { Bell } from 'lucide-react';
import DOMPurifyLib from 'dompurify';
import { VariantInventory } from '@entities/product/api/getInventoryLevels';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';
import { ButtonGroup, ButtonGroupSeparator } from '@shared/ui/button-group';
import { usePostHog } from 'posthog-js/react';

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

export const ProductInfo = ({
  product,
  colorOptions,
  sizeOptions,
  selectedVariant,
  setSize,
  boundProduct,
  size,
  attributes,
  inventoryLevels,
}: {
  product: ShopifyProduct;
  colorOptions: string[] | undefined;
  sizeOptions: string[] | undefined;
  boundProduct: ShopifyProduct[] | undefined;
  selectedVariant: ProductVariant | undefined;
  setSize: (value: string) => void;
  size: string;
  attributes: ProductMEtaobjectType[];
  inventoryLevels: VariantInventory[];
}) => {
  const t = useTranslations('ProductPage');
  const locale = useLocale();
  const posthog = usePostHog();
  const [isQuickBuyOpen, setQuickBuyOpen] = useState(false);
  const [isPriceSubscribeOpen, setPriceSubscribeOpen] = useState(false);
  const [isDescExpanded, setDescExpanded] = useState(false);
  const [isDescOverflowing, setDescOverflowing] = useState(false);
  const [, startSizeTransition] = useTransition();
  const descRef = useRef<HTMLDivElement>(null);
  const cleanHtml = useMemo(() => {
    if (typeof window === 'undefined') return product.descriptionHtml;
    const purify = typeof DOMPurifyLib === 'function' ? DOMPurifyLib(window) : DOMPurifyLib;
    return purify.sanitize(product.descriptionHtml);
  }, [product.descriptionHtml]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => setDescOverflowing(el.scrollHeight > el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cleanHtml]);

  const sale =
    product.metafields.find((m) => m?.key === 'znizka')?.value || '0';
  const sku = product.variants.edges[0].node.sku;

  const COLOR_NAMES = ['колір', 'цвет', 'color'];
  const colorOptionsValues = [
    ...(colorOptions?.map((name) => ({ name, product: product.handle })) || []),
    ...(boundProduct?.flatMap(
      (p) =>
        p.options
          .find((o) => COLOR_NAMES.includes(o.name.toLowerCase()))
          ?.optionValues.map((v) => ({ name: v.name, product: p.handle })) ||
        [],
    ) || []),
  ];

  const sortedSizeOptions = useMemo(() => sizeOptions?.slice().sort(compareSizes), [sizeOptions]);
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
                    ['розмір', 'размер', 'size'].includes(
                      option.name.toLowerCase(),
                    ) && option.value.toLowerCase() === s.toLowerCase(),
                ),
              )?.node;
              const availableForSale = variant?.availableForSale ?? false;
              const qty = variant?.quantityAvailable ?? -1;
              const isZeroQty = qty === 0;
              const variantAtFitting =
                variant?.currentlyNotInStock === false && isZeroQty;
              const isUnavailable = !availableForSale && !isZeroQty;
              const inventoryLevel = variant
                ? inventoryLevels.find((inv) => inv.variantId === variant.id)
                : undefined;
              const committed = inventoryLevel?.committed ?? 0;
              const hasCommitted =
                committed > 0 && inventoryLevel!.available === 0;
              const showCrossed =
                isUnavailable ||
                (isZeroQty && !variantAtFitting && !hasCommitted);
              const showMuted = (isUnavailable || isZeroQty) && !hasCommitted;
              const btn = (
                <Button
                  variant={
                    size.toLowerCase() === s.toLowerCase()
                      ? 'default'
                      : 'outline'
                  }
                  className={cn(
                    'rounded min-w-[56px] h-11 text-sm font-medium relative border-primary border capitalize',
                    {
                      'bg-primary text-white ring-2 ring-offset-1 ring-primary ':
                        size.toLowerCase() === s.toLowerCase(),
                      'opacity-40':
                        showMuted && size.toLowerCase() !== s.toLowerCase(),
                    },
                  )}
                  onClick={() => startSizeTransition(() => setSize(s.toLowerCase()))}
                  disabled={isUnavailable}
                >
                  {s.toUpperCase()}
                  {showCrossed && <CrossedLine />}
                  {hasCommitted && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white leading-none">
                      !
                    </span>
                  )}
                </Button>
              );
              if (!hasCommitted)
                return <React.Fragment key={s}>{btn}</React.Fragment>;
              return (
                <Popover key={s}>
                  <PopoverTrigger asChild>{btn}</PopoverTrigger>
                  <PopoverContent className="w-56 text-sm p-3" side="top">
                    <p className="font-medium">{t('reservedSizeTitle')}</p>
                    <p className="text-muted-foreground mt-1">
                      {t('reservedSizeDescription')}
                    </p>
                  </PopoverContent>
                </Popover>
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
                  key={c.product}
                  href={`/product/${c.product}`}
                  className={cn('group', {
                    'pointer-events-none opacity-50': !availableForSale,
                  })}
                >
                  <div
                    className={cn(
                      ' border p-1 transition-all rounded flex justify-center items-center',
                      c.product === product.handle
                        ? 'border-black'
                        : ' border-gray-200 group-hover:border-gray-300',
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded',
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
        <div className="w-full">
          <div
            ref={descRef}
            className={cn(
              'text-md font-sans leading-relaxed text-gray-700 prose prose-md max-w-none overflow-hidden transition-all duration-300',
              isDescExpanded ? 'max-h-none' : 'max-h-[110px]',
            )}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
          {(isDescOverflowing || isDescExpanded) && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
            >
              {isDescExpanded ? 'Згорнути' : 'Показати більше'}
            </button>
          )}
        </div>
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
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            className=" h-10 md:h-12 text-sm rounded flex items-center gap-2 w-1/2"
            onClick={() => {
              posthog?.capture('quick_order_opened', {
                product_handle: product.handle,
                product_title: product.title,
                size,
              });
              setQuickBuyOpen(true);
            }}
            disabled={
              selectedVariant
                ? selectedVariant.quantityAvailable === 0 &&
                  !selectedVariant.currentlyNotInStock
                : product.variants.edges.every(
                    (e) =>
                      e.node.quantityAvailable === 0 &&
                      !e.node.currentlyNotInStock,
                  )
            }
          >
            {t('quickOrder')}
          </Button>
          <ButtonGroupSeparator />
          <Button
            variant="outline"
            className=" h-10 md:h-12 text-sm rounded flex items-center gap-2 w-1/2"
            onClick={() => setPriceSubscribeOpen(true)}
          >
            <Bell className="w-4 h-4" />
            {t('priceSubscribeButton')}
          </Button>
        </ButtonGroup>
      </div>
      <QuickBuyModal
        product={product}
        open={isQuickBuyOpen}
        onOpenChange={setQuickBuyOpen}
        sizeOptions={sizeOptions}
        inventoryLevels={inventoryLevels}
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
