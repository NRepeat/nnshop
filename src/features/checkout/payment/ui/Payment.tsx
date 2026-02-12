import { auth } from '@features/auth/lib/auth';
import { getCart } from '@entities/cart/api/get';
import PaymentForm from './PaymentForm';
import { getPaymentInfo } from '../api/getPaymentInfo';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';

export default async function Payment({
  locale,
}: {
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
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect('/auth/sign-in');
    }

    const cartResult = (await getCart({
      userId: session.user.id,
      locale,
    })) as GetCartQuery | null;
    if (cartResult && cartResult.cart) {
      currency = cartResult.cart.cost.totalAmount.currencyCode;
      // Calculate total with znizka metafield discount applied
      // Shopify cart total doesn't include znizka, so calculate locally
      const lines = cartResult.cart.lines.edges;
      let localTotal = 0;
      for (const edge of lines) {
        const line = edge.node;
        const price = Number(line.cost.amountPerQuantity.amount);
        const sale = Number(
          line.merchandise.product.metafields?.find((m: any) => m?.key === 'znizka')?.value || '0'
        ) || 0;
        const discountedPrice = sale > 0 ? price * (1 - sale / 100) : price;
        localTotal += discountedPrice * line.quantity;
      }
      // Also subtract any cart discount code discounts
      const shopifySubtotal = Number(cartResult.cart.cost.subtotalAmount?.amount || 0);
      const shopifyTotal = Number(cartResult.cart.cost.totalAmount.amount);
      const codeDiscount = shopifySubtotal > shopifyTotal ? shopifySubtotal - shopifyTotal : 0;
      cartAmount = localTotal - codeDiscount;
    }

    const completeCheckoutData = await getCompleteCheckoutData(session);

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
          amount={cartAmount}
          currency={currency}
          locale={locale}
          liqpayPublicKey={liqpayPublicKey}
          liqpayPrivateKey={liqpayPrivateKey}
          completeCheckoutData={completeCheckoutData}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching cart data:', error);
    redirect('/');
  }
}
