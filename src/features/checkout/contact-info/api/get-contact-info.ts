'use server';

import { prisma } from '@shared/lib/prisma';
import { Session, User } from 'better-auth';


const getContactInfo = async (
  session: { session: Session; user: User } | null,
) => {
  try {
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
