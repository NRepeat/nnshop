'use server';
import { cookies } from 'next/headers';
import { ContactInfo } from '../schema/contactInfoSchema';

export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const cookieStore = await cookies();
    const contactInfoCookie = cookieStore.get('contactInfo');

    if (!contactInfoCookie) {
      return null;
    }

    return JSON.parse(contactInfoCookie.value) as ContactInfo;
  } catch (error) {
    console.error('Error getting contact info:', error);
    return null;
  }
}
