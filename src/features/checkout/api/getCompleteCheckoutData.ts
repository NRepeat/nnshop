import { getContactInfo } from '@entities/checkout/api/getContactInfo';
import { CheckoutData } from '../schema/checkoutDataSchema';
import { getDeliveryInfo } from '../delivery/api/getDeliveryInfo';

export async function getCompleteCheckoutData(): Promise<Omit<
  CheckoutData,
  'paymentInfo'
> | null> {
  try {
    const contactInfo = await getContactInfo();
    const deliveryInfo = await getDeliveryInfo();

    if (!contactInfo || !deliveryInfo) {
      return null;
    }
    const completeDeliveryInfo = {
      ...deliveryInfo,
      deliveryMethod: deliveryInfo.deliveryMethod || 'novaPoshta',
    };

    return {
      contactInfo,
      deliveryInfo: completeDeliveryInfo,
    };
  } catch (error) {
    console.error('Error getting complete checkout data:', error);
    return null;
  }
}
