import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

const getContactInfo = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error('Session not found');
  }

  const contactInfo = await prisma.contactInformation.findUnique({
    where: { userId: session.user.id },
  });
  return contactInfo;
};
export default getContactInfo;
