'use server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function generateOrderId(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user?.id) {
      return `${session.user.id}-${uuidv4()}`;
    }

    const randomId = uuidv4();
    return `order-${randomId}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    const randomId = uuidv4();
    return `order-${randomId}`;
  }
}
