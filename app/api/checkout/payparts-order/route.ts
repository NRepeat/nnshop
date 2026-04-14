import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { createOrder } from '@features/order/api/create';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { getCart } from '@entities/cart/api/get';
import { createPayParts } from '@entities/payparts/model';

/**
 * POST /api/checkout/payparts-order
 *
 * Creates a Shopify order and initiates a PrivatBank "Оплата частинами" payment.
 * Returns the redirect URL for the PrivatBank payment page.
 *
 * Flow: createPayment → get token → redirect user to PrivatBank.
 * PrivatBank callback arrives at /api/payparts/callback when status changes.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { locale, currency, amount, partsCount = 3 } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 1. Get complete checkout data
    const completeCheckoutData = await getCompleteCheckoutData(session);
    if (!completeCheckoutData) {
      return NextResponse.json({ error: 'Checkout data missing' }, { status: 400 });
    }

    // 2. Fetch cart for product details
    const cartData = await getCart({ userId: session.user.id, locale });
    const cartLineItems = (cartData && 'cart' in cartData ? cartData.cart : null)?.lines?.edges?.map((e: any) => ({
      title: e.node.merchandise.product?.title || e.node.merchandise.title,
      quantity: e.node.quantity as number,
      price: parseFloat(e.node.cost.amountPerQuantity.amount),
    }));

    // 3. Create Shopify order (draft, no receipt)
    const orderResult = await createOrder(completeCheckoutData, locale, false, 'pay-now', {
      draftInDb: true,
      paymentGatewayName: 'payparts',
    });
    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        { error: orderResult.errors?.[0] || 'Failed to create order' },
        { status: 500 },
      );
    }
    const createdOrder = orderResult.order;
    console.log('[payparts-order] order created (draft):', createdOrder.id);

    // Use Shopify's confirmed total
    const shopifyTotal = parseFloat(createdOrder.totalPriceSet.shopMoney.amount);
    const paypartsAmount = shopifyTotal > 0 ? shopifyTotal : amount;

    // Min amount for PayParts is 300 UAH
    if (paypartsAmount < 300) {
      return NextResponse.json(
        { error: 'Мінімальна сума для оплати частинами — 300 грн' },
        { status: 400 },
      );
    }

    // 4. Create PayParts payment
    const payparts = createPayParts();
    const orderId = createdOrder.id.split('/').pop()!;

    const products = cartLineItems?.map((item: any) => ({
      name: item.title.slice(0, 255),
      count: item.quantity,
      price: Math.round(item.price * 100) / 100,
    })) || [{ name: 'Замовлення', count: 1, price: paypartsAmount }];

    // PayParts requires amount === sum(product.price * product.count)
    const productsTotal = products.reduce(
      (sum: number, p: { price: number; count: number }) => sum + Math.round(p.price * p.count * 100) / 100,
      0,
    );
    const finalAmount = Math.round(productsTotal * 100) / 100;

    const paymentResult = await payparts.createHoldPayment({
      orderId,
      amount: finalAmount,
      partsCount: Math.min(partsCount, 3),
      merchantType: 'PP',
      products,
      responseUrl: `${baseUrl}/api/payparts/callback`,
      redirectUrl: `${baseUrl}/checkout/success/${orderId}`,
      advancePaymentDisabled: true,
    });

    const paymentUrl = payparts.getPaymentUrl(paymentResult.token!);
    console.log('[payparts-order] payment URL:', paymentUrl);

    // 5. Save payment info
    await savePaymentInfo(
      {
        paymentMethod: 'pay-now',
        paymentProvider: 'liqpay-payparts',
        amount: paypartsAmount,
        currency: currency || 'UAH',
        description: `PayParts token: ${paymentResult.token}`,
      },
      createdOrder.id,
    );

    return NextResponse.json({ paymentUrl, token: paymentResult.token });
  } catch (error) {
    console.error('[payparts-order] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
