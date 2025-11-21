import { getContactInfo } from '@entities/checkout/api/getContactInfo';
import { CheckoutData } from '../shema';
import { getDeliveryInfo } from '@entities/checkout/api/getDeliveryInfo';
import { getPaymentInfo } from './getPaymentInfo';

export async function getCompleteCheckoutData(): Promise<CheckoutData | null> {
  try {
    const contactInfo = await getContactInfo();
    const deliveryInfo = await getDeliveryInfo();
    const paymentInfo = await getPaymentInfo();

    if (!contactInfo || !deliveryInfo || !paymentInfo) {
      return null;
    }

    // Ensure deliveryInfo has deliveryMethod
    const completeDeliveryInfo = {
      ...deliveryInfo,
      deliveryMethod: deliveryInfo.deliveryMethod || 'novaPoshta',
    };

    return {
      contactInfo,
      deliveryInfo: completeDeliveryInfo,
      paymentInfo,
    };
  } catch (error) {
    console.error('Error getting complete checkout data:', error);
    return null;
  }
}
