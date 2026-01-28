import { getOrder } from '@entities/order/api/getOrder';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { OrderDetails } from '@features/order/ui/OrderDetails';
import { Suspense } from 'react';
import { prisma } from '@shared/lib/prisma';
import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';

const OrderDetailSkeleton = () => (
  <div className="container mx-auto py-10 min-h-screen mt-2 md:mt-10">
    <BreadcrumbsSkeleton />
    <div className="mt-4 space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full py-4">
            <div className="flex items-center justify-between">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && <Skeleton className="h-1 flex-1" />}
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    {i < 3 && <Skeleton className="h-1 flex-1" />}
                  </div>
                  <Skeleton className="h-3 w-16 mt-2" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-20 shrink-0" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-px w-full my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-px w-full my-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderPageSession params={params} />
    </Suspense>
  );
}

const OrderPageSession = async ({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) => {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const tHeader = await getTranslations({ locale, namespace: 'Header.nav' });
  const tOrderPage = await getTranslations({ locale, namespace: 'OrderPage' });

  const orderId = `gid://shopify/Order/${id}`;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const localOrder = await prisma.order.findFirst({
    where: { shopifyOrderId: orderId },
    include: {
      user: {
        include: {
          contactInformation: true,
          deliveryInformation: {
            include: { novaPoshtaDepartment: true },
          },
          paymentInformation: true,
        },
      },
    },
  });

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: tOrderPage('title'), href: '/orders' },
    {
      label: order.name,
      href: `/orders/${id}`,
      isCurrent: true,
    },
  ];

  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10 min-h-screen">
      <Breadcrumbs items={breadcrumbItems} />
      <OrderDetails order={order} locale={locale} localOrder={localOrder} />
    </div>
  );
};
