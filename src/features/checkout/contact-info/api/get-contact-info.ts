'use server';

import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

const getContactInfo = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return null;
    }

    const contactInfo = await prisma.contactInformation.findUnique({
      where: { userId: session.user.id },
    });
    return contactInfo;
  } catch (error) {
    console.error('Error getting contact info:', error);
    return null;
  }
};
export default getContactInfo;
