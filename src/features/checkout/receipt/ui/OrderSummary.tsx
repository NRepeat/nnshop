import { getTranslations } from 'next-intl/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { getCart } from '@entities/cart/api/get';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { getCurrencySymbol } from '@shared/lib/utils/getCurrencySymbol';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@shared/ui/accordion';
import { DiscountCodeInput } from '@features/cart/ui/DiscountCodeInput';

interface OrderSummaryProps {
  locale: string;
  collapsible?: boolean;
}

interface CartItem {
  id: string;
  title: string;
  handle: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  discountedPrice: number;
  quantity: number;
  totalPrice: number;
  sale: number;
  size?: string;
  color?: string;
  sizeLabel: string;
  quantityLabel: string;
}

function formatPrice(price: number): string {
  return Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function OrderItemCard({
  item,
  currency,
}: {
  item: CartItem;
  currency: string;
}) {
  const currencySymbol = getCurrencySymbol(currency);

  return (
    <div className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0">
      {/* Product Image */}
      <div className="relative w-20 h-24 flex-shrink-0 bg-white overflow-hidden rounded border border-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-contain"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
          {item.title}
        </p>
        {item.size && (
          <p className="text-xs text-gray-500 mb-2">
            {item.sizeLabel}: {item.size} &times; {item.quantity}
          </p>
        )}

      </div>

      {/* Total Price */}
      <div className="flex-shrink-0 text-right">
        {item.sale > 0 ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs line-through text-gray-400">{formatPrice(item.price)} {currencySymbol}</span>
            <span className="text-sm font-medium text-red-600">{formatPrice(item.discountedPrice)} {currencySymbol}</span>
          </div>
        ) : item.compareAtPrice ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs line-through text-gray-400">{formatPrice(item.compareAtPrice)} {currencySymbol}</span>
            <span className="text-sm font-medium text-red-600">{formatPrice(item.price)} {currencySymbol}</span>
          </div>
        ) : (
          <span className="text-sm font-medium">{formatPrice(item.discountedPrice)} {currencySymbol}</span>
        )}
      </div>
    </div>
  );
}

export async function OrderSummary({
  locale,
  collapsible = false,
}: OrderSummaryProps) {
  const t = await getTranslations({ locale, namespace: 'ReceiptPage' });
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const cartResult = (await getCart({
    userId: session.user.id,
    locale,
  })) as GetCartQuery | null;

  if (!cartResult?.cart || cartResult.cart.lines.edges.length === 0) {
    return null;
  }

  const cart = cartResult.cart;
  const currency = cart.cost.totalAmount.currencyCode;
  const currencySymbol = getCurrencySymbol(currency);

  // Process cart items with discounts
  const items: CartItem[] = cart.lines.edges.map((edge) => {
    const line = edge.node;
    const product = line.merchandise.product;
    const sale =
      Number(
        product.metafields?.find((m) => m?.key === 'znizka')?.value || '0',
      ) || 0;
    const price = Number(line.cost.amountPerQuantity.amount);
    const compareAtAmount = (line.cost as any).compareAtAmountPerQuantity?.amount;
    const compareAtPrice = compareAtAmount ? Number(compareAtAmount) : null;
    const discountedPrice = price - (price * sale) / 100;
    const totalPrice =
      sale > 0 ? discountedPrice * line.quantity : price * line.quantity;

    const sizeOption = line.merchandise.selectedOptions?.find(
      (opt) =>
        opt.name.toLowerCase() === 'розмір' ||
        opt.name.toLowerCase() === 'размер' ||
        opt.name.toLowerCase() === 'size',
    );
    const colorOption = line.merchandise.selectedOptions?.find(
      (opt) =>
        opt.name.toLowerCase() === 'color' ||
        opt.name.toLowerCase() === 'колір',
    );

    return {
      id: line.id,
      title: product.title,
      handle: product.handle,
      image: line.merchandise.image?.url || null,
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
      discountedPrice,
      quantity: line.quantity,
      totalPrice,
      sale,
      size: sizeOption?.value,
      color: colorOption?.value,
      sizeLabel: t('size_label'),
      quantityLabel: t('quantity_label'),
    };
  });

  // Calculate totals with discounts
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Get discount codes from cart
  const discountCodes = cart.discountCodes || [];
  const hasApplicableDiscount = discountCodes.some((d) => d.applicable);

  // Use Shopify's authoritative total (based on full prices minus code discounts)
  const shopifyTotal = Number(cart.cost.totalAmount.amount);
  // Total shown to user: min(znizka subtotal, shopify code total) — same logic as Payment.tsx
  const totalAmount = hasApplicableDiscount ? Math.min(subtotal, shopifyTotal) : subtotal;
  // Effective discount = difference between what user sees (znizka prices) and what they pay
  const discountAmount = hasApplicableDiscount ? Math.max(0, subtotal - shopifyTotal) : 0;
  const grandTotal = totalAmount;

  const content = (
    <>
      {/* Items List */}
      <div className="max-h-[40vh] overflow-y-auto px-4">
        {items.map((item) => (
          <OrderItemCard key={item.id} item={item} currency={currency} />
        ))}
      </div>

      {/* Discount Code Input */}
      <div className="px-4 pt-3">
        <DiscountCodeInput discountCodes={discountCodes} />
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 mt-2 pt-3 px-4 pb-4 space-y-2">
        {hasApplicableDiscount && (
          <>
            <div className="flex justify-between text-sm ">
              <div className="flex flex-col gap-1">
                <span>{t('discount')}</span>
                {discountCodes
                  .filter((d) => d.applicable)
                  .map((discount) => (
                    <span key={discount.code} className="text-xs font-medium">
                      {discount.code}
                    </span>
                  ))}
              </div>
              <span className='text-green-600'>
                -{formatPrice(discountAmount)}{" "}
                {currencySymbol}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-100">
          <span className="text-gray-900">{t('total')}</span>
          <span className="text-gray-900">
            {formatPrice(grandTotal)}{" "}
            {currencySymbol}
          </span>
        </div>
      </div>
    </>
  );

  if (collapsible) {
    return (
      <Accordion
        type="single"
        collapsible
        className="border border-gray-200 bg-white md:hidden rounded"
      >
        <AccordionItem value="order-summary" className="border-none">
          <AccordionTrigger className="p-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded bg-gray-100">
                <ShoppingBag className="size-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {t('products_title')}
                </p>
                <p className="text-xs text-gray-500">
                  {formatPrice(grandTotal)}{" "}
                  {currencySymbol}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">{content}</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="border border-gray-200 bg-white rounded">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-gray-100">
          <ShoppingBag className="size-5 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {t('products_title')}
          </p>
        </div>
      </div>
      {content}
    </div>
  );
}

export function OrderSummarySkeleton() {
  return (
    <div className="border border-gray-200 bg-white animate-pulse">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded bg-gray-100" />
        <div className="flex-1">
          <div className="h-4 w-20 bg-gray-100 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-20 bg-gray-100 rounded" />
            <div className="flex-1">
              <div className="h-4 w-full bg-gray-100 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
