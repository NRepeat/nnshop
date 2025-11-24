import CheckoutHeader from '@features/checkout/ui/CheckoutHeader';
export default async function Layout({
  children,
  params,
  receipt,
}: {
  children: React.ReactNode;
  receipt: React.ReactNode;
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug } = await params;

  return (
    <>
      <CheckoutHeader slug={slug} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {children}
        {receipt}
        {/*<Receipt />*/}
      </div>
    </>
  );
}
