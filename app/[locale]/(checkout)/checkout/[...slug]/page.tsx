import CheckoutView from '@widgets/checkout/ui/view';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const { slug } = params;

  if (!slug || slug.length === 0) {
    return redirect('/');
  }
  let orderId = '';

  if (slug.length > 1 && slug[0] === 'payment') {
    orderId = slug[1];
    return;
  } else if (slug.length > 1 && slug[1] === 'liqpay') {
    orderId = slug[2];
    return;
  } else if (slug.length > 2) {
    orderId = slug[2];
    return;
  } else if (slug.length >= 1) {
    orderId = slug[1];
  }
  return <CheckoutView orderId={orderId} slug={slug[0]} />;
}
