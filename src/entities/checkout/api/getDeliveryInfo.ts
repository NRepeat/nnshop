'use server';
import { DeliveryInfo } from '@entities/checkout/schema/delivery';
import { auth } from '@features/auth/lib/auth';
import { cookies } from 'next/headers';

export async function getDeliveryInfo(): Promise<DeliveryInfo | null> {
  try {
    const cookieStore = await cookies();
    const deliveryInfoCookie = cookieStore.get('deliveryInfo');
    if (!deliveryInfoCookie) {
      return null;
    }

    return JSON.parse(deliveryInfoCookie.value) as DeliveryInfo;
  } catch (error) {
    console.error('Error getting delivery info:', error);
    return null;
  }
}
