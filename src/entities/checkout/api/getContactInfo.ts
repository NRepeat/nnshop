'use server';
import { auth } from '@features/auth/lib/auth';
import { ContactInfo } from '@features/checkout/schema/contactInfoSchema';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

export async function getContactInfo(): Promise<ContactInfo | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new Error('Session not found');
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const contactInfo = await prisma.contactInformation.findUnique({
      where: { userId: user.id },
    });
    if (!contactInfo) {
      throw new Error('Contact info not found');
    }
    return contactInfo;
  } catch (error) {
    console.error('Error getting contact info:', error);
    return null;
  }
}
