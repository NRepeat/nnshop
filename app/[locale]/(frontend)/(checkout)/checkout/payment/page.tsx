import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Payment } from '@features/checkout';
import { Skeleton } from '@shared/ui/skeleton';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { createOrder } from '@features/order/api/create';

type Props = {
  params: Promise<{ locale: string }>;
};

function PaymentFormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

async function getOrderId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const order = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      draft: false,
    },
  });
  console.log(order,"order")
  if (!order?.shopifyOrderId) return null;

  const match = order.shopifyOrderId.match(/Order\/(\d+)/);
  return match ? match[1] : null;
}

export default async function PaymentPage(props: Props) {
  const { locale } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  const deliveryInfo = await getDeliveryInfo(session);
  if (!deliveryInfo) {
    redirect('/checkout/delivery');
  }

  let orderId = await getOrderId();
  if (!orderId) {
    const completeCheckoutData = await getCompleteCheckoutData(session);
    if (!completeCheckoutData) {
      redirect('/checkout/delivery');
    }
    const orderResult = await createOrder(completeCheckoutData, locale);
    if (!orderResult) {
      throw new Error("Can't create order");
    }
    if (orderResult.success && orderResult.order?.id) {
      const match = orderResult.order.id.match(/Order\/(\d+)/);
      orderId = match ? match[1] : null;
    }
  }
  if (!orderId) {
    redirect('/checkout/delivery');
  }
  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <Payment draftOrderId={orderId} locale={locale} />
    </Suspense>
  );
}
