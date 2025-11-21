import { cookies } from 'next/headers';

export async function generateOrderId(): Promise<string> {
  try {
    // Get session ID from cart-session-id cookie
    const cookieStore = await cookies();
    const deliveryInfoCookie = cookieStore.get('deliveryInfo');
    const sessionCookie = cookieStore.get('cart-session-id');

    if (sessionCookie?.value) {
      const sessionId = sessionCookie.value;
      const timestamp = Date.now();
      return `session-${sessionId}-${timestamp}`;
    }

    // Fallback: try to get cart ID from old cart cookie
    const cartCookie = cookieStore.get('cart');
    if (cartCookie?.value) {
      const cartId = cartCookie.value;
      const timestamp = Date.now();
      return `${cartId}-${timestamp}`;
    }

    // Final fallback: generate random order ID
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
