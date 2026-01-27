import { auth } from '@features/auth/lib/auth';
import CheckoutHeader from '@features/checkout/ui/CheckoutHeader';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function CheckoutLayoutContent({
  children,
  receipt,
  params,
}: {
  children: React.ReactNode;
  receipt: React.ReactNode;
  params: Promise<{ slug: string[]; locale: string }>;
}) {
  const { slug, locale } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect('/auth/sign-in');
    }
  } catch (error) {
    console.error('Checkout auth error:', error);
    redirect('/auth/sign-in');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CheckoutHeader slug={slug} locale={locale} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-10 flex-1 container">
        {children}
        {receipt}
      </div>
    </div>
  );
}

export default async function Layout({
  children,
  params,
  receipt,
}: {
  children: React.ReactNode;
  receipt: React.ReactNode;
  params: Promise<{ slug: string[]; locale: string }>;
}) {
  return (
    <Suspense>
      <CheckoutLayoutContent params={params} receipt={receipt}>
        {children}
      </CheckoutLayoutContent>
    </Suspense>
  );
}
