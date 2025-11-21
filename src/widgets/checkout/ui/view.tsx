import ContactInfo from '@features/checkout/ui/ContactInfo';
import Delivery from '@features/checkout/ui/Delivery';
import Payment from '@features/checkout/ui/Payment';

export default function CheckoutView({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string;
}) {
  return (
    <>
      {slug == 'info' ? (
        <ContactInfo />
      ) : slug[0] == 'delivery' ? (
        <Delivery />
      ) : slug[0] == 'payment' ? (
        <Payment />
      ) : slug[0] === 'success' ? (
        <>Ty</>
      ) : // <Thank orderId={orderId} />
      null}
    </>
  );
}
