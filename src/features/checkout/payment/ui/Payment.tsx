import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { getCart } from '@entities/cart/api/get';
import PaymentForm from './PaymentForm';
import { getPaymentInfo } from '../api/getPaymentInfo';
import { generateOrderId } from '../api/generateOrderId';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';

export default async function Payment() {
  const orderId = await generateOrderId();

  const liqpayPublicKey = process.env.LIQPAY_PUBLIC_KEY;
  const liqpayPrivateKey = process.env.LIQPAY_PRIVATE_KEY;

  let existingPaymentInfo = null;
  try {
    existingPaymentInfo = await getPaymentInfo();
  } catch (error) {
    console.error('Error fetching payment info:', error);
  }

  let cartAmount = 0;
  let currency = 'UAH';
  let completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });
    if (!sessionCart) {
      return redirect('/');
    }
    const cartResult = await getCart(sessionCart.cartToken);
    if (cartResult && cartResult.cart?.cost?.totalAmount) {
      cartAmount = parseFloat(cartResult.cart.cost.totalAmount.amount);
      currency = cartResult.cart.cost.totalAmount.amount; // Should be currencyCode
    }
    completeCheckoutData = await getCompleteCheckoutData();
  } catch (error) {
    console.error('Error fetching cart data:', error);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">
          Complete your order with secure payment processing
        </p>
      </div>

      <PaymentForm
        defaultValues={existingPaymentInfo}
        orderId={orderId}
        amount={cartAmount}
        currency={currency}
        liqpayPublicKey={liqpayPublicKey}
        liqpayPrivateKey={liqpayPrivateKey}
        completeCheckoutData={completeCheckoutData}
      />
    </div>
  );
}
