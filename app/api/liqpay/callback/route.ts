import LiqPay from '@entities/liqpay/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { completeOrder } from '@features/checkout/payment/api/completeOrder';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { PaymentInfo } from '@features/checkout/payment/schema/paymentSchema';
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
      const dtuftOrderId = paymentData.order_id;
      if (!dtuftOrderId) {
        return NextResponse.json(
          { error: 'Invalid cart token' },
          { status: 400 },
        );
      }

      const completedOrder = await completeOrder(dtuftOrderId);
      const paymentInfo: PaymentInfo = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'pay-now',
        paymentProvider: 'liqpay',
        description: '',
        orderId: completedOrder.id,
      };
      await savePaymentInfo(paymentInfo, completedOrder.id);
      await resetCartSession(completedOrder.id);
      return NextResponse.json(
        {
          message: 'Payment processed successfully',
          orderId: completedOrder.id,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('LiqPay callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
