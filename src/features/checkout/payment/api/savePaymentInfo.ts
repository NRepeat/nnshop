'use server';
import { cookies } from 'next/headers';
import { PaymentInfo, paymentSchema } from '../schema/paymentSchema';

export async function savePaymentInfo(
  data: PaymentInfo,
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = paymentSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please fix the validation errors.',
      };
    }

    const paymentInfo = validationResult.data;

    // Save to cookie session
    const cookieStore = await cookies();
    const paymentInfoJson = JSON.stringify(paymentInfo);

    cookieStore.set('paymentInfo', paymentInfoJson, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Payment information saved successfully!',
    };
  } catch (error) {
    console.error('Error saving payment info:', error);
    return {
      success: false,
      message:
        'An error occurred while saving your payment information. Please try again.',
    };
  }
}
