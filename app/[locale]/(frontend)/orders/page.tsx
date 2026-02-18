import { getCustomerOrders } from '@entities/order/api/getCustomerOrders';
import { auth } from '@features/auth/lib/auth';
import { OrderEmptyState } from '@features/order/ui/EmptyState';
import { OrderList } from '@features/order/ui/OrderList';
import { locales } from '@shared/i18n/routing';
import { Breadcrumbs, BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';

const OrdersPageSkeleton = () => (
  <div className="container mx-auto py-10 min-h-screen mt-2 md:mt-10">
    <BreadcrumbsSkeleton />
    <Skeleton className="h-8 w-48 my-4" />
    <div className="flex flex-wrap gap-2 mb-6">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-20" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mt-2">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="w-14 h-14 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-4 w-28 mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);


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
  if (!user?.email) {
    return <OrderEmptyState type="notLoggedIn" locale={locale} />;
  }

  const orders = await getCustomerOrders(user.email, locale.toUpperCase());

  if (orders.length === 0) {
    return <OrderEmptyState type="emptyState" locale={locale} />;
  }

  const searchParamsData = await searchParams;
  const sortBy = searchParamsData?.sortBy as string;
  const order = searchParamsData?.order as string;

  let sortedOrders = [...orders];
  if (sortBy === 'date') {
    sortedOrders.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === 'status') {
    sortedOrders.sort((a, b) => {
      const statusA = a.displayFulfillmentStatus;
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
    <div className="container mx-auto py-10 min-h-[60vh] my-2 mb-10 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <OrderList orders={sortedOrders as any} />
    </div>
  );
}
export default async function OrdersPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<OrdersPageSkeleton />}>
      <OrdersPageSession params={params} searchParams={searchParams} />
    </Suspense>
  );
}

