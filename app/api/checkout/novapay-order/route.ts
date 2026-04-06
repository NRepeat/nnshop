import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { createOrder } from '@features/order/api/create';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { getCompleteCheckoutData } from '@features/checkout/api/getCompleteCheckoutData';
import { getCart } from '@entities/cart/api/get';
import { createNovaPay } from '@entities/novapay/model';

/**
 * POST /api/checkout/novapay-order
 *
 * Creates a Shopify order (sendReceipt: false) and initiates a NovaPay payment session.
 * Returns the NovaPay payment page URL for client-side redirect.
 *
 * Flow: createSession → addPayment(use_hold: true) → redirect user to payment URL.
 * NovaPay postback will arrive at /api/novapay/callback when status changes.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { locale, currency, amount } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 1. Get complete checkout data
    const completeCheckoutData = await getCompleteCheckoutData(session);
    if (!completeCheckoutData) {
      return NextResponse.json({ error: 'Checkout data missing' }, { status: 400 });
    }

    // 2. Fetch cart for product details
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

    // 3. Create Shopify order (draft, no receipt, skip process-order)
    const orderResult = await createOrder(completeCheckoutData, locale, false, 'pay-now', {
      skipProcessOrder: true,
      draftInDb: true,
    });
    if (!orderResult.success || !orderResult.order) {
      return NextResponse.json(
        { error: orderResult.errors?.[0] || 'Failed to create order' },
        { status: 500 },
      );
    }
    const createdOrder = orderResult.order;
    console.log('[novapay-order] order created (draft):', createdOrder.id);

    // Use Shopify's confirmed total so NovaPay amount matches the order exactly
    const shopifyTotal = parseFloat(createdOrder.totalPriceSet.shopMoney.amount);
    const novapayAmount = shopifyTotal > 0 ? shopifyTotal : amount;
    const novapayCurrency = createdOrder.totalPriceSet.shopMoney.currencyCode || currency;

    // 4. Create NovaPay session + add payment with hold
    const novapay = createNovaPay();
    const { contactInfo } = completeCheckoutData;

    // Format phone for NovaPay (expects +380...)
    let phone = contactInfo.phone;
    if (!phone.startsWith('+')) phone = `+${phone}`;

    const sessionResult = await novapay.createSession({
      client_phone: phone,
      client_first_name: contactInfo.name,
      client_last_name: contactInfo.lastName,
      client_email: contactInfo.email,
      callback_url: `${baseUrl}/api/novapay/callback`,
      success_url: `${baseUrl}/checkout/success/${createdOrder.id.split('/').pop()}`,
      fail_url: `${baseUrl}/checkout/payment`,
      metadata: {
        shopifyOrderId: createdOrder.id,
        orderName: createdOrder.name,
      },
    });
    console.log('[novapay-order] session created:', sessionResult.id);

    // Build products array for NovaPay
    const products = cartLineItems?.map((item: any) => ({
      description: item.title,
      count: item.quantity,
      price: Math.round(item.price * 100) / 100,
    }));

    const paymentResult = await novapay.addPayment({
      session_id: sessionResult.id,
      amount: Math.round(novapayAmount * 100) / 100,
      external_id: createdOrder.name || createdOrder.id.split('/').pop()!,
      use_hold: true,
      products,
    });
    console.log('[novapay-order] payment added, URL:', paymentResult.url);

    // 5. Save payment info
    await savePaymentInfo(
      {
        paymentMethod: 'pay-now',
        paymentProvider: 'novapay',
        amount: novapayAmount,
        currency: novapayCurrency,
        description: `NovaPay session: ${sessionResult.id}`,
      },
      createdOrder.id,
    );

    return NextResponse.json({ paymentUrl: paymentResult.url, sessionId: sessionResult.id });
  } catch (error) {
    console.error('[novapay-order] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
