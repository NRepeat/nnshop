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
        <Thank orderId={orderId} />
      ) : null}
    </>
  );
}
