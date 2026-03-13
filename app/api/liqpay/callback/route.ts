import LiqPay from '@entities/liqpay/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { PaymentInfo } from '@features/checkout/payment/schema/paymentSchema';
import { prisma } from '@shared/lib/prisma';
import { captureServerEvent, captureServerError } from '@shared/lib/posthog/posthog-server';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.LIQPAY_PUBLIC_KEY || !process.env.LIQPAY_PRIVATE_KEY) {
  throw new Error('LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY must be set');
}

const liqpay = new LiqPay(
  process.env.LIQPAY_PUBLIC_KEY!,
  process.env.LIQPAY_PRIVATE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;
    if (!liqpay.verifyCallback(data, signature)) {
      await captureServerError(new Error('Invalid LiqPay signature'), {
        service: 'api',
        action: 'liqpay_callback_invalid_signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    const paymentData = liqpay.decodeData(data);
    if (paymentData.status === 'success' || paymentData.status === 'sandbox') {
      const shopifyOrderId = paymentData.order_id;
      if (!shopifyOrderId) {
        await captureServerError(new Error('LiqPay callback missing order_id'), {
          service: 'api',
          action: 'liqpay_callback_no_order_id',
          extra: { paymentData },
        });
        return NextResponse.json(
          { error: 'Invalid order id' },
          { status: 400 },
        );
      }

      // Find the order in prisma by shopifyOrderId
      const order = await prisma.order.findUnique({
        where: { shopifyOrderId },
      });
      if (!order) {
        await captureServerError(new Error('LiqPay callback order not found in DB'), {
          service: 'api',
          action: 'liqpay_callback_order_not_found',
          extra: { shopifyOrderId },
        });
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const paymentInfo: PaymentInfo = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'pay-now',
        paymentProvider: 'bank-transfer',
        description: `LiqPay payment: status=${paymentData.status}, liqpayOrderId=${paymentData.payment_id || ''}`,
        orderId: order.id,
      };
      await savePaymentInfo(paymentInfo, order.id);
      await resetCartSession(order.id);
      await captureServerEvent(order.userId, 'payment_completed', {
        order_id: order.id,
        shopify_order_id: shopifyOrderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_provider: 'liqpay',
        liqpay_payment_id: paymentData.payment_id,
      });
      return NextResponse.json(
        {
          message: 'Payment processed successfully',
          orderId: order.id,
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ message: 'Callback received' });
  } catch (error) {
    await captureServerError(error, {
      service: 'api',
      action: 'liqpay_callback_internal_error',
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
