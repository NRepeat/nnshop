import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { getCart } from '@entities/cart/api/get';
import PaymentForm from './PaymentForm';
import { getPaymentInfo } from '../api/getPaymentInfo';
import { headers } from 'next/headers';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';

export default async function Payment({
  draftOrderId,
  locale,
}: {
  draftOrderId: string;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: 'CheckoutPage' });
  const liqpayPublicKey = process.env.LIQPAY_PUBLIC_KEY;
  const liqpayPrivateKey = process.env.LIQPAY_PRIVATE_KEY;

  let existingPaymentInfo: any = null;
  try {
    existingPaymentInfo = await getPaymentInfo();
  } catch (error) {
    console.error('Error fetching payment info:', error);
  }

  let cartAmount = 0;
  let currency = 'UAH';
  let completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null = null;
  let draftOrder = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const sessionCart = await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
    });
    if (!sessionCart) {
      throw new Error('Cart not found');
    }

    const cartResult = (await getCart({
      userId: session.user.id,
      locale,
    })) as GetCartQuery | null;
    if (cartResult && cartResult.cart?.cost?.totalAmount) {
      cartAmount = parseFloat(cartResult.cart.cost.totalAmount.amount);
      currency = cartResult.cart.cost.totalAmount.currencyCode;
    }
    draftOrder = await prisma.order.findUnique({
      where: {
        shopifyDraftOrderId: 'gid://shopify/DraftOrder/' + draftOrderId,
      },
    });
    if (!draftOrder) {
      throw new Error('Draft order not found');
    }
    console.log('draftOrder', draftOrder);
    if (draftOrder.shopifyOrderId) {
      throw new Error('Order already exists');
    }
  } catch (error) {
    console.error('Error fetching cart data:', error);
    redirect(`/`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('payment_title')}
        </h1>
        <p className="text-gray-600">{t('payment_description')}</p>
      </div>

      <PaymentForm
        defaultValues={existingPaymentInfo}
        draftOrder={draftOrder}
        amount={cartAmount}
        currency={currency}
        liqpayPublicKey={liqpayPublicKey}
        liqpayPrivateKey={liqpayPrivateKey}
        completeCheckoutData={completeCheckoutData}
      />
    </div>
  );
}
