const PRICE_APP_URL = process.env.PRICE_APP_URL ?? 'https://prod.nnninc.uk';

type ExternalLineItem = {
  title: string;
  quantity: number;
  sku?: string;
  image?: { url: string };
};

type ExternalOrder = {
  name: string;
  financialStatus: string;
  fulfillmentStatus: string;
  tags: string[];
  createdAt?: string;
  total: { amount: string; currencyCode: string };
  lineItems: ExternalLineItem[];
};

export type CustomerOrder = {
  id: string;
  name: string;
  createdAt: string;
  displayFulfillmentStatus: string;
  financialStatus: string;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: { edges: { node: { title: string; image?: { url: string } } }[] };
};

function mapOrder(order: ExternalOrder): CustomerOrder {
  // Derive numeric id from name: "#1001" → "gid://shopify/Order/1001"
  const numeric = order.name.replace(/^#/, '');
  return {
    id: `gid://shopify/Order/${numeric}`,
    name: order.name,
    createdAt: order.createdAt ?? '',
    displayFulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    totalPriceSet: {
      shopMoney: {
        amount: order.total.amount,
        currencyCode: order.total.currencyCode,
      },
    },
    lineItems: {
      edges: order.lineItems.map((item) => ({
        node: { title: item.title, image: item.image },
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
