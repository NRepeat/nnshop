import { Suspense } from 'react';
import { ContactInfo } from '@features/checkout';
import { CheckoutAuthGate } from '@features/checkout/contact-info/ui/CheckoutAuthGate';
import { Skeleton } from '@shared/ui/skeleton';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

type Props = {
  params: Promise<{ locale: string }>;
};

function ContactInfoFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default async function InfoPage(props: Props) {
  const { locale } = await props.params;

  const session = await auth.api.getSession({ headers: await headers() });
  const isAnonymous = !session || (session.user as { isAnonymous?: boolean }).isAnonymous === true;

  return (
    <div className="space-y-8">
      <Suspense fallback={<ContactInfoFormSkeleton />}>
        <ContactInfo locale={locale} />
      </Suspense>
      {isAnonymous && <CheckoutAuthGate />}
    </div>
  );
}
