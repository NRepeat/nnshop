import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Delivery } from '@features/checkout';
import { Skeleton } from '@shared/ui/skeleton';
import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';

type Props = {
  params: Promise<{ locale: string }>;
};

function DeliveryFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default async function DeliveryPage(props: Props) {
  const { locale } = await props.params;

  const contactInfo = await getContactInfo();
  if (!contactInfo) {
    redirect('/checkout/info');
  }

  return (
    <Suspense fallback={<DeliveryFormSkeleton />}>
      <Delivery locale={locale} />
    </Suspense>
  );
}
