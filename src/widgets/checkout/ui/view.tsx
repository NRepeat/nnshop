import { ContactInfo, Delivery, Payment } from '@features/checkout';
import { Thank } from '@entities/thank-page/ui/Thank';

export default function CheckoutView({
  slug,
  orderId,
  locale,
}: {
  slug: string;
  orderId: string;
  locale: string;
}) {
  return (
    <div className="container  ">
      {slug == 'info' ? (
        <ContactInfo locale={locale} />
      ) : slug == 'delivery' ? (
        <Delivery locale={locale} />
      ) : slug == 'payment' ? (
        <Payment draftOrderId={orderId} locale={locale} />
      ) : slug === 'success' ? (
        <Thank orderId={orderId} locale={locale} />
      ) : null}
    </div>
  );
}
