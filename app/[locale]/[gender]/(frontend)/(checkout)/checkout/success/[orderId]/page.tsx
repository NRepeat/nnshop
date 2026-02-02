import { Suspense } from 'react';
import { Thank } from '@entities/thank-page/ui/Thank';
import { Skeleton } from '@shared/ui/skeleton';

type Props = {
  params: Promise<{ locale: string; orderId: string }>;
};

function SuccessSkeleton() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-full p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default async function SuccessPage(props: Props) {
  const { locale, orderId } = await props.params;

  return (
    <Suspense fallback={<SuccessSkeleton />}>
      <Thank orderId={orderId} locale={locale} />
    </Suspense>
  );
}
