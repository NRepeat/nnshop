import { fetchAllOrdersByIDs } from '@entities/order/api/getOrdersByIds';
import { auth } from '@features/auth/lib/auth';
import { OrderEmptyState } from '@features/order/ui/EmptyState';
import { OrderList } from '@features/order/ui/OrderList';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { prisma } from '@shared/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export default async function OrdersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'OrderPage' });
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user?.isAnonymous) {
    return <OrderEmptyState type="notLoggedIn" />;
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return <OrderEmptyState type="notLoggedIn" />;
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
    return <OrderEmptyState type="emptyState" />;
  }

  const orders = await fetchAllOrdersByIDs(numericOrderIDs);

  if (orders.length === 0) {
    return <OrderEmptyState type="emptyState" />;
  }

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/orders', isCurrent: true },
  ];

  return (
    <div className="container mx-auto py-10 h-screen mt-10">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <OrderList orders={orders as any} />
    </div>
  );
}
