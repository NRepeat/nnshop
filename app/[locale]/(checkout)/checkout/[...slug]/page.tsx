import Payment from '@/app/components/Checkout/Payment/Payment';
import { Thank } from '@/app/components/Checkout/Thank/Thank';
import { ContactInfo } from '@/app/components/Checkout';
import Delivery from '@/app/components/Checkout/Delivery/Delivery';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
// export async function generateStaticParams() {
//   return [
//     { slug: ['info'] },
//     { slug: ['delivery'] },
//     { slug: ['payment'] },
//     { slug: ['success'] },
//     { slug: ['success', 'orderIdPlaceholder'] },
//   ];
// }

export default async function Page(props: Props) {
  const params = await props.params;
  const { slug } = params;

  // Extract orderId from URL for success page
  const orderId = slug[1] || '';

  return (
    <>
      {slug == 'info' ? (
        <ContactInfo />
      ) : slug[0] == 'delivery' ? (
        <Delivery />
      ) : slug[0] == 'payment' ? (
        <Payment />
      ) : slug[0] === 'success' ? (
        <Thank orderId={orderId} />
      ) : null}
    </>
  );
}
