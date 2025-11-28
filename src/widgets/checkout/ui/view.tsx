import { ContactInfo, Delivery, Payment } from '@features/checkout';
import { Thank } from '@entities/thank-page/ui/Thank';

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
        <Payment draftOrderId={orderId} />
      ) : slug === 'success' ? (
        <Thank orderId={orderId} />
      ) : null}
    </div>
  );
}
