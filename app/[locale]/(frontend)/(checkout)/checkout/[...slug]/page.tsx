import CheckoutView from '@widgets/checkout/ui/view';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string[]; locale: string }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const { slug, locale } = params;
  if (!slug || slug.length === 0) {
    return redirect('/');
  }
  let orderId = '';
  if (slug.length >= 2) {
    orderId = slug[slug.length - 1];
  }
  return (
    <Suspense>
      <CheckoutView orderId={orderId} slug={slug[0]} locale={locale} />;
    </Suspense>
  );
}
