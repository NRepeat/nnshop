import LiqPay from '@entities/liqpay/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { PaymentInfo } from '@features/checkout/payment/schema/paymentSchema';
import { prisma } from '@shared/lib/prisma';
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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    const paymentData = liqpay.decodeData(data);
    if (paymentData.status === 'success' || paymentData.status === 'sandbox') {
      const shopifyOrderId = paymentData.order_id;
      if (!shopifyOrderId) {
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
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 },
        );
      }

      const paymentInfo: PaymentInfo = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'pay-now',
        paymentProvider: 'after-delivered',
        description: '',
        orderId: order.id,
      };
      await savePaymentInfo(paymentInfo, order.id);
      await resetCartSession(order.id);
      return NextResponse.json(
        {
          message: 'Payment processed successfully',
          orderId: order.id,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('LiqPay callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
