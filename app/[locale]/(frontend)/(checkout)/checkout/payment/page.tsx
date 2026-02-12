import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Payment } from '@features/checkout';
import { Skeleton } from '@shared/ui/skeleton';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';

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

export default async function PaymentPage(props: Props) {
  const { locale } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth/sign-in');
  }

  const deliveryInfo = await getDeliveryInfo(session);
  if (!deliveryInfo) {
    redirect('/checkout/delivery');
  }

  const completeCheckoutData = await getCompleteCheckoutData(session);
  if (!completeCheckoutData) {
    redirect('/checkout/delivery');
  }

  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <Payment locale={locale} />
    </Suspense>
  );
}
