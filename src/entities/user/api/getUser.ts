'use server';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { headers } from 'next/headers';

const getUser = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return null;
    if (user.isAnonymous) return null;
    return user;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get user');
  }
};

export default getUser;
