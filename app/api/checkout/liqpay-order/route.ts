import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { createOrder } from '@features/order/api/create';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { getLiqpayFormParams } from '@features/checkout/payment/api/getLiqpayFormParams';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { getCart } from '@entities/cart/api/get';

/**
 * POST /api/checkout/liqpay-order
 *
 * Creates a Shopify order and returns LiqPay form params.
 * Uses a regular API route (not a server action) to avoid Next.js RSC refresh,
 * which would race against the form submission to liqpay.ua and navigate
 * the user back to the checkout page ("Falling back to browser navigation").
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { locale, currency, amount } = body;

    // 1. Get complete checkout data (same as payment page guard)
    const completeCheckoutData = await getCompleteCheckoutData(session);
    if (!completeCheckoutData) {
      return NextResponse.json({ error: 'Checkout data missing' }, { status: 400 });
    }

    // 2. Fetch cart for rro_info price data (before order creation, cart still exists)
    const cartData = await getCart({ userId: session.user.id, locale });
    const cartLineItems = (cartData && 'cart' in cartData ? cartData.cart : null)?.lines?.edges?.map((e: any) => {
      const variantGid: string = e.node.merchandise.id;
      const numericId = parseInt(variantGid.split('/').pop() || '0', 10);
      return {
        title: e.node.merchandise.product?.title || e.node.merchandise.title,
        variantId: numericId,
        quantity: e.node.quantity as number,
        price: parseFloat(e.node.cost.amountPerQuantity.amount),
      };
    });

    // 3. Create the Shopify order
    const orderResult = await createOrder(completeCheckoutData, locale, false, 'pay-now');
    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        { error: orderResult.errors?.[0] || 'Failed to create order' },
        { status: 500 },
      );
    }
    const createdOrder = orderResult.order;
    console.log('[liqpay-order] order created:', createdOrder.id);

    // 4. Save payment info
    await savePaymentInfo(
      {
        paymentMethod: 'pay-now',
        paymentProvider: 'liqpay',
        amount,
        currency,
        description: `LiqPay order ${createdOrder.name}`,
      },
      createdOrder.id,
    );

    // 5. Generate LiqPay form params
    const params = await getLiqpayFormParams({
      shopifyOrderId: createdOrder.id,
      orderName: createdOrder.name || `#${createdOrder.id.split('/').pop()}`,
      amount,
      currency,
      checkoutData: completeCheckoutData,
      lineItems: cartLineItems ?? createdOrder.lineItems?.edges?.map((e: any) => ({
        title: e.node.title,
        quantity: e.node.quantity,
      })),
    });

    console.log('[liqpay-order] params ready for order:', createdOrder.id);
    return NextResponse.json({ data: params.data, signature: params.signature });
  } catch (error) {
    console.error('[liqpay-order] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
