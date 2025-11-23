'use server';
import { auth } from '@features/auth/lib/auth';
import { cookies } from 'next/headers';
import { DeliveryInfo } from '../model/deliverySchema';

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
