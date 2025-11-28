import { fetchAllOrdersByIDs } from '@entities/order/api/getOrdersByIds';
import { auth } from '@features/auth/lib/auth';
import { OrderEmptyState } from '@features/order/ui/EmptyState';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export default async function OrdersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user?.isAnonymous) {
    return <OrderEmptyState />;
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return <OrderEmptyState />;
  }

  const orderIdentifiers = await prisma.order.findMany({
    where: { userId: user.id, shopifyOrderId: { not: null } },
    select: { shopifyOrderId: true },
  });

  const numericOrderIDs = orderIdentifiers
    .map((item) => {
      if (!item.shopifyOrderId) return null;
      const match = item.shopifyOrderId.match(/\/(\d+)$/);
      return match ? match[1] : item.shopifyOrderId;
    })
    .filter((i) => i !== null);

  if (numericOrderIDs.length === 0) {
    return <OrderEmptyState />;
  }

  const orders = await fetchAllOrdersByIDs(numericOrderIDs);

  if (orders.length === 0) {
    return <OrderEmptyState />;
  }

  return (
    <div>
      <h1>My Orders</h1>
      <p>
        Orders for **{session.user.email}** ({orders.length} found):
      </p>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            Order **{order.name}** | Placed:{' '}
            {new Date(order.createdAt).toLocaleDateString()} | Total:{' '}
            {order.totalPriceSet.shopMoney.amount}{' '}
            {order.totalPriceSet.shopMoney.currencyCode}
          </li>
        ))}
      </ul>
    </div>
  );
}
