import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { CheckoutStepper } from '@entities/checkout/ui/CheckoutStepper';
import { getCompletedSteps } from '@features/checkout/api/getCompletedSteps';
import { Skeleton } from '@shared/ui/skeleton';
import { connection } from 'next/server';

function CheckoutLayoutSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full py-4">
        <div className="flex items-center justify-between container">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 1 && <div className="h-1 flex-1 bg-muted" />}
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                {i < 4 && <div className="h-1 flex-1 bg-muted" />}
              </div>
              <Skeleton className="h-3 w-12 mt-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-10 container flex-1">
        <Skeleton className="h-64 w-full" />
        <div className="hidden md:flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReceiptSkeleton() {
  return (
    <div className="hidden md:flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-none border border-gray-100 bg-white p-4 animate-pulse">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-100" />
          <div className="flex flex-col gap-2 w-full">
            <div className="h-3 w-24 rounded-full bg-gray-100" />
            <div className="h-3 w-40 rounded-full bg-gray-100" />
            <div className="h-3 w-32 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CheckoutLayoutContent({
  children,
  receipt,
}: {
  children: React.ReactNode;
  receipt: React.ReactNode;
}) {
  await connection();

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect('/auth/sign-in');
    }
  } catch (error) {
    console.error('Checkout auth error:', error);
    redirect('/auth/sign-in');
  }

  const completedSteps = await getCompletedSteps();

  return (
    <div className="min-h-screen flex flex-col">
      <CheckoutStepper completedSteps={completedSteps} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-10 container flex-1">
        {children}
        <Suspense fallback={<ReceiptSkeleton />}>
          {receipt}
        </Suspense>
      </div>
    </div>
  );
}

export default async function Layout({
  children,
  receipt,
}: {
  children: React.ReactNode;
  receipt: React.ReactNode;
}) {
  return (
    <Suspense fallback={<CheckoutLayoutSkeleton />}>
      <CheckoutLayoutContent receipt={receipt}>
        {children}
      </CheckoutLayoutContent>
    </Suspense>
  );
}
