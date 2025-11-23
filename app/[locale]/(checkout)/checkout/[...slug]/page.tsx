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
  const orderId = slug.length > 0 ? slug[1] : '';

  return <CheckoutView orderId={orderId} slug={slug[0]} />;
}
