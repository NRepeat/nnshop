import { getCart } from '@entities/cart/api/get';
import { auth } from '@features/auth/lib/auth';
import CheckoutHeader from '@features/checkout/ui/CheckoutHeader';
import { tryCatch } from '@shared/lib/try-catch';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
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
  try {
    const cart = await getCart();
    console.log(cart, 'cart---------');
    if (!cart) {
      throw new Error('Cart not found');
    }
  } catch (error) {
    console.error(error);
    redirect('/');
  }

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
