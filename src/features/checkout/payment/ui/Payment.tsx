import { auth } from '@features/auth/lib/auth';
import { getCart } from '@entities/cart/api/get';
import PaymentForm from './PaymentForm';
import { getPaymentInfo } from '../api/getPaymentInfo';
import { headers } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import {
  DISCOUNT_METAFIELD_KEY,
  DEFAULT_CURRENCY_CODE,
} from '@shared/config/shop';
import { prisma } from '@shared/lib/prisma';

export default async function Payment({ locale }: { locale: string }) {
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
  let currency = DEFAULT_CURRENCY_CODE;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect('/auth/sign-in');
    }

    const cartResult = (await getCart({
      userId: session.user.id,
      locale,
    })) as GetCartQuery | null;
    if (!cartResult?.cart || !cartResult.cart.lines.edges.length) {
      redirect('/cart');
    }

    const isAnonymousUser = Boolean(session.user.isAnonymous);
    let bonusBalance = 0;
    if (!isAnonymousUser) {
      try {
        const loyaltyCard = await prisma.loyaltyCards.findFirst({
          where: { userId: session.user.id },
        });
        bonusBalance = loyaltyCard?.bonusBalance ?? 0;
      } catch (e) {
        console.error('Error fetching loyalty card:', e);
      }
    }

    let eligibleAmount = 0;
    {
      currency = cartResult.cart.cost.totalAmount.currencyCode;
      const lines = cartResult.cart.lines.edges;
      let localTotal = 0;
      let shopifySubtotal = 0;
      for (const edge of lines) {
        const line = edge.node;
        const price = Number(line.cost.amountPerQuantity.amount);
        const sale =
          Number(
            line.merchandise.product.metafields?.find(
              (m: any) => m?.key === DISCOUNT_METAFIELD_KEY,
            )?.value || '0',
          ) || 0;
        const discountedPrice = sale > 0 ? price * (1 - sale / 100) : price;
        localTotal += discountedPrice * line.quantity;
        shopifySubtotal += price * line.quantity;

        // Bonus rules: eligible if discount <= 40%
        if (sale <= 40) {
          eligibleAmount += discountedPrice * line.quantity;
        }
      }
      // Sum cart-level + line-level discountAllocations to capture both order-level and
      // product-level automatic discounts (automatic line discounts only appear at line level)
      const cartDiscountTotal = [
        ...(cartResult.cart.discountAllocations || []),
        ...cartResult.cart.lines.edges.flatMap(
          (e) => (e.node.discountAllocations as any[]) || [],
        ),
      ].reduce(
        (sum: number, d: any) => sum + Number(d.discountedAmount.amount),
        0,
      );
      // Shopify calculates the discount on original prices; derive rate and apply to sale subtotal
      // cartDiscountTotal > 0 covers both code-based and automatic discounts
      const discountRate =
        cartDiscountTotal > 0 && shopifySubtotal > 0
          ? cartDiscountTotal / shopifySubtotal
          : 0;
      const discountAmount = localTotal * discountRate;
      cartAmount = Math.max(0, localTotal - discountAmount);

      // Adjust eligibleAmount by the cart-level discount rate too
      eligibleAmount = eligibleAmount * (1 - discountRate);
    }
    if (cartAmount <= 0) {
      redirect('/cart');
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
          bonusBalance={bonusBalance}
          eligibleAmount={eligibleAmount}
          showBonusCard={!isAnonymousUser}
        />
      </div>
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error('Error fetching cart data:', error);
    redirect('/');
  }
}
