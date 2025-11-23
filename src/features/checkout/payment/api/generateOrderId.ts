'use server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

export async function generateOrderId(): Promise<string> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user?.id) {
      const timestamp = Date.now();
      return `user-${session.user.id}-${timestamp}`;
    }

    // Fallback: generate random order ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    return `order-${timestamp}-${randomId}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    return `order-${timestamp}-${randomId}`;
  }
}
