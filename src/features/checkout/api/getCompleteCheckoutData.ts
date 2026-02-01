import { CheckoutData } from '../schema/checkoutDataSchema';
import { getDeliveryInfo } from '../delivery/api/getDeliveryInfo';
import { Session, User } from 'better-auth';
import getContactInfo from '../contact-info/api/get-contact-info';

export async function getCompleteCheckoutData(
  session: { session: Session; user: User } | null,
): Promise<Omit<CheckoutData, 'paymentInfo'> | null> {
  try {
    const contactInfo = await getContactInfo(session);
    const deliveryInfo = await getDeliveryInfo(session);

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
