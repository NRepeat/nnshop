// import { fetchAllOrdersByIDs } from '@entities/order/api/getOrdersByIds';
// import { auth } from '@features/auth/lib/auth';
// import { OrderEmptyState } from '@features/order/ui/EmptyState';
// import { OrderList } from '@features/order/ui/OrderList';
// import { Breadcrumbs } from '@shared/ui/breadcrumbs';
// import { prisma } from '@shared/lib/prisma';
// import { getTranslations } from 'next-intl/server';
// import { headers } from 'next/headers';

import { fetchAllOrdersByIDs } from '@entities/order/api/getOrdersByIds';
import { auth } from '@features/auth/lib/auth';
import { OrderEmptyState } from '@features/order/ui/EmptyState';
import { OrderList } from '@features/order/ui/OrderList';
import { locales } from '@shared/i18n/routing';
import { prisma } from '@shared/lib/prisma';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';


export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    params.push({ locale: locale });
  }
  return params;
}
type Props = {
  params: Promise<{ locale: string }>;

  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export async function OrdersPageSession({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations('OrderPage');
  const tHeader = await getTranslations('Header.nav');

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user?.isAnonymous) {
    return <OrderEmptyState type="notLoggedIn" locale={locale} />;
  }
  const user = session.user;
  if (!user) {
    return <OrderEmptyState type="notLoggedIn" locale={locale} />;
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
    return <OrderEmptyState type="emptyState" locale={locale} />;
  }

  const orders = await fetchAllOrdersByIDs(numericOrderIDs);

  if (orders.length === 0) {
    return <OrderEmptyState type="emptyState" locale={locale} />;
  }
  const searchParamsData = await searchParams;
  const sortBy = searchParamsData?.sortBy as string;
  const order = searchParamsData?.order as string;

  let sortedOrders = [...orders];
  if (sortBy === 'date') {
    sortedOrders.sort((a, b) => {
      //@ts-ignore
      const dateA = new Date(a.createdAt).getTime();
      //@ts-ignore
      const dateB = new Date(b.createdAt).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === 'status') {
    sortedOrders.sort((a, b) => {
      //@ts-ignore
      const statusA = a.displayFulfillmentStatus;
      //@ts-ignore
      const statusB = b.displayFulfillmentStatus;
      if (statusA < statusB) return order === 'asc' ? -1 : 1;
      if (statusA > statusB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/orders', isCurrent: true },
  ];

  return (
    <div className="container mx-auto py-10 h-screen mt-2 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <OrderList orders={sortedOrders as any} />
    </div>
  );
}
export default async function OrdersPage({ params, searchParams }: Props) {
  return (
    <Suspense>
      <OrdersPageSession params={params} searchParams={searchParams} />
    </Suspense>
  );
}
