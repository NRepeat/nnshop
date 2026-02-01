'use server';

import { auth } from '@features/auth/lib/auth';
// import { redirect } from '@shared/i18n/navigation';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const addToFavorites = async (productId: string, userId: string) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return false;
    }

    console.log(
      `Adding product ${productId} to favorites for user ${userId}`,
      session,
    );

    // TODO: Implement actual favorite adding logic here
    // Anonymous and authenticated users can add favorites

    return true;
  } catch (error) {
    throw error;
  }
};
