import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Payment } from '@features/checkout';
import { Skeleton } from '@shared/ui/skeleton';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { createDraftOrder } from '@features/order/api/create';

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

async function getDraftOrderId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const draftOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      draft: true,
    },
  });

  if (!draftOrder?.shopifyDraftOrderId) return null;

  const match = draftOrder.shopifyDraftOrderId.match(/DraftOrder\/(\d+)/);
  return match ? match[1] : null;
}

export default async function PaymentPage(props: Props) {
  const { locale } = await props.params;

  const deliveryInfo = await getDeliveryInfo();
  console.log('🚀 ~ PaymentPage ~ deliveryInfo:', deliveryInfo);
  if (!deliveryInfo) {
    redirect('/checkout/delivery');
  }

  let draftOrderId = await getDraftOrderId();
  if (!draftOrderId) {
    const completeCheckoutData = await getCompleteCheckoutData();
    console.log("🚀 ~ PaymentPage ~ completeCheckoutData:", completeCheckoutData)
    if (!completeCheckoutData) {
      redirect('/checkout/delivery');
    }
    const draftOrder = await createDraftOrder(completeCheckoutData, locale);
    if (!draftOrder) {
      throw new Error("Can't create druft order");
    }
    if (draftOrder.success && draftOrder.order?.id) {
      draftOrderId = draftOrder.order?.id;
    }
  }
  if (!draftOrderId) {
    redirect('/checkout/delivery');
  }
  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <Payment draftOrderId={draftOrderId} locale={locale} />
    </Suspense>
  );
}
