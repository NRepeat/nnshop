import { getOrder } from '@entities/order/api/getOrder';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs } from '@shared/ui/breadcrumbs';
import { OrderDetails } from '@features/order/ui/OrderDetails';

export default async function OrderPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const tHeader = await getTranslations('Header.nav');
  const tOrderPage = await getTranslations('OrderPage');

  const orderId = `gid://shopify/Order/${id}`;

  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

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
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <Breadcrumbs items={breadcrumbItems} />
      <OrderDetails order={order} />
    </div>
  );
}
