import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { getTranslations } from 'next-intl/server';
import React from 'react';

function OrderListItemSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b animate-pulse">
      <div className="flex flex-col gap-2 w-full md:w-1/2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div> {/* Order ID */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div> {/* Order Date */}
      </div>
      <div className="flex flex-col gap-2 w-full md:w-1/4 mt-4 md:mt-0">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div> {/* Total */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div> {/* Status */}
      </div>
    </div>
  );
}

export default async function OrdersLoading() {
  const t = await getTranslations('OrderPage');
  const tHeader = await getTranslations('Header.nav');

  const breadcrumbItems = [
    { label: tHeader('home'), href: '/' },
    { label: t('title'), href: '/orders', isCurrent: true },
  ];

  return (
    <div className="container mx-auto py-10 h-screen mt-2 md:mt-10 animate-pulse">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-2xl font-bold my-4">{t('title')}</h1>
      <div className="border rounded-lg">
        {Array.from({ length: 5 }).map((_, i) => (
          <OrderListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
