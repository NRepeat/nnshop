import CheckoutView from '@widgets/checkout/ui/view';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { SkeletonLoader } from '@/shared/ui/skeleton-loader';
import getContactInfo from '@features/checkout/contact-info/api/get-contact-info';
import { getDeliveryInfo } from '@features/checkout/delivery/api/getDeliveryInfo';

type Props = {
  params: Promise<{ slug: string[]; locale: string }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const { slug, locale } = params;
  if (!slug || slug.length === 0) {
    return redirect('/');
  }

  const step = slug[0];

  if (step === 'delivery') {
    const contactInfo = await getContactInfo();
    if (!contactInfo) {
      redirect('/checkout/info');
    }
  }

  if (step === 'payment') {
    const deliveryInfo = await getDeliveryInfo();
    if (!deliveryInfo) {
      redirect('/checkout/delivery');
    }
  }

  let orderId = '';
  if (slug.length >= 2) {
    orderId = slug[slug.length - 1];
  }
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <CheckoutView orderId={orderId} slug={step} locale={locale} />
    </Suspense>
  );
}
