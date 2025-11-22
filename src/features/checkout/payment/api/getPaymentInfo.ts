'use server';
import { cookies } from 'next/headers';
import { PaymentInfo } from '../schema/paymentSchema';

export async function getPaymentInfo(): Promise<PaymentInfo | null> {
  try {
    const cookieStore = await cookies();
    const paymentInfoCookie = cookieStore.get('paymentInfo');

    if (!paymentInfoCookie) {
      return null;
    }

    return JSON.parse(paymentInfoCookie.value) as PaymentInfo;
  } catch (error) {
    console.error('Error getting payment info:', error);
    return null;
  }
}
