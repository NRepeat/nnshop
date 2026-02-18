import { fetchProductImages } from './fetchProductImages';

const PRICE_APP_URL = process.env.PRICE_APP_URL ?? 'https://prod.nnninc.uk';

type ExternalLineItem = {
  title: string;
  quantity: number;
  price?: { amount: string; currencyCode: string };
  sku?: string;
  variantTitle?: string;
  productHandle?: string;
};

type ExternalOrder = {
  id: string;
  name: string;
  createdAt: string;
  cancelledAt?: string | null;
  financialStatus: string;
  fulfillmentStatus: string;
  tags: string[];
  total?: { amount: string; currencyCode: string };
  subtotal?: { amount: string; currencyCode: string };
  lineItems: ExternalLineItem[];
};

export type CustomerOrder = {
  id: string;
  name: string;
  createdAt: string;
  displayFulfillmentStatus: string;
  financialStatus: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  subtotalPriceSet?: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: { edges: { node: { title: string; image?: { url: string } } }[] };
};

export async function getCustomerOrders(
  email: string,
  locale = 'UK',
): Promise<CustomerOrder[]> {
  const res = await fetch(
    `${PRICE_APP_URL}/api/customer?email=${encodeURIComponent(email)}`,
    { cache: 'no-store' },
  );

  if (res.status === 404) return [];
  if (!res.ok) {
    console.error(`getCustomerOrders: ${res.status} for ${email}`);
    return [];
  }

  const data = await res.json();
  const orders: ExternalOrder[] = data?.customer?.orders ?? [];

  // Collect all unique product handles across all orders for batch image fetch
  const allHandles = orders.flatMap((o) =>
    o.lineItems.map((item) => item.productHandle ?? ''),
  );
  const images = await fetchProductImages(allHandles, locale);

  return orders.map((order) => ({
    id: order.id,
    name: order.name,
    createdAt: order.createdAt,
    displayFulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    totalPriceSet: {
      shopMoney: order.total ?? { amount: '0', currencyCode: 'UAH' },
    },
    subtotalPriceSet: order.subtotal
      ? { shopMoney: order.subtotal }
      : undefined,
    lineItems: {
      edges: order.lineItems.map((item) => ({
        node: {
          title: item.title,
          image: item.productHandle && images[item.productHandle]
            ? { url: images[item.productHandle] }
            : undefined,
        },
      })),
    },
  }));
}
