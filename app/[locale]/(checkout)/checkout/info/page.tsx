import { Suspense } from 'react';
import { ContactInfo } from '@features/checkout';
import { Skeleton } from '@shared/ui/skeleton';

type Props = {
  params: Promise<{ locale: string }>;
};

function ContactInfoFormSkeleton() {
  return (
    <div className="space-y-6 ">
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

  return (
    <Suspense fallback={<ContactInfoFormSkeleton />}>
      <ContactInfo locale={locale} />
    </Suspense>
  );
}
