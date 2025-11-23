import { ContactInfo, Delivery, Payment } from '@features/checkout';

export default function CheckoutView({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string;
}) {
  return (
    <div className="container  ">
      {slug == 'info' ? (
        <ContactInfo />
      ) : slug == 'delivery' ? (
        <Delivery />
      ) : slug == 'payment' ? (
        <Payment />
      ) : slug === 'success' ? (
        <>Ty</>
      ) : // <Thank orderId={orderId} />
      null}
    </div>
  );
}
