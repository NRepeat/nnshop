import { Order } from '../model/types';
import { fetchProductImages } from './fetchProductImages';
import { PRICE_APP_URL, DEFAULT_CURRENCY_CODE } from '@shared/config/shop';

export async function getOrderById(
  orderId: string,
  locale = 'UK',
): Promise<Order | null> {
  // Accept numeric id or full GID — the external API handles both
  const numeric = orderId.startsWith('gid://')
    ? orderId.split('/').pop()!
    : orderId;

  const res = await fetch(`${PRICE_APP_URL}/api/order/${numeric}`, {
    cache: 'no-store',
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`getOrderById: ${res.status} for ${orderId}`);
    return null;
  }

  const data = await res.json();
  const order = data?.order;
  if (!order) return null;

  const lineItems: Array<{
    title: string;
    quantity: number;
    price?: { amount: string; currencyCode: string };
    variantTitle?: string;
    productHandle?: string;
  }> = order.lineItems ?? [];

  const handles = lineItems.map((i) => i.productHandle ?? '');
  const images = await fetchProductImages(handles, locale);

  return {
    id: order.id,
    name: order.name,
    processedAt: order.createdAt,
    fulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    email: order.email ?? '',
    shippingAddress: order.shippingAddress ?? {},
    billingAddress: order.billingAddress ?? {},
    lineItems: {
      edges: lineItems.map((item) => ({
        node: {
          title: item.title,
          quantity: item.quantity,
          variant: {
            title: item.variantTitle ?? '',
            price: item.price ?? { amount: '0', currencyCode: DEFAULT_CURRENCY_CODE },
          },
          image: item.productHandle && images[item.productHandle]
            ? { url: images[item.productHandle] }
            : undefined,
        },
      })),
    },
    subtotalPriceSet: {
      presentmentMoney: order.subtotal ?? { amount: '0', currencyCode: DEFAULT_CURRENCY_CODE },
    },
    totalShippingPriceSet: {
      presentmentMoney: order.totalShipping ?? { amount: '0', currencyCode: DEFAULT_CURRENCY_CODE },
    },
    totalTaxSet: {
      presentmentMoney: order.totalTax ?? { amount: '0', currencyCode: DEFAULT_CURRENCY_CODE },
    },
    totalPriceSet: {
      presentmentMoney: order.total ?? { amount: '0', currencyCode: DEFAULT_CURRENCY_CODE },
    },
  } as Order;
}
