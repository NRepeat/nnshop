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
  note?: string;
  total?: { amount: string; currencyCode: string };
  subtotal?: { amount: string; currencyCode: string };
  shippingAddress?: Record<string, string>;
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

function mapOrder(order: ExternalOrder): CustomerOrder {
  return {
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
        node: { title: item.title },
      })),
    },
  };
}

export async function getCustomerOrders(
  email: string,
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
  return orders.map(mapOrder);
}
