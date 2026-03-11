'use server';

import { addToCartAction } from '@entities/cart/api/add-product';
import { checkInventoryLevel } from './check-inventory-level';
import { captureServerEvent, captureServerError } from '@shared/lib/posthog/posthog-server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

async function addToCart(_: any, formData: FormData) {
  try {
    const variantId = formData.get('variantId')?.toString();
    console.log('[addToCart] variantId:', variantId);

    if (!variantId) {
      console.warn('[addToCart] Missing variant ID');
      return { success: false, message: 'Missing variant ID' };
    }

    const itemQuantity = await checkInventoryLevel(variantId);
    console.log('[addToCart] inventory check:', itemQuantity);
    if (!itemQuantity || itemQuantity.quantity === 0) {
      console.warn('[addToCart] No inventory for variantId:', variantId);
      return { success: false, message: 'No products available' };
    }

    const result = await addToCartAction(variantId);
    console.log('[addToCart] addToCartAction result:', result.success, result.error ?? '');

    if (!result.success) {
      return { success: false, message: result.error };
    }

    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    const distinctId = session?.user?.id ?? 'anonymous';
    console.log('[addToCart] capturing PostHog event for distinctId:', distinctId);
    await captureServerEvent(distinctId, 'add_to_cart', {
      variant_id: variantId,
      product_title: formData.get('productTitle')?.toString(),
      product_handle: formData.get('productHandle')?.toString(),
      price: formData.get('price')?.toString(),
      currency: formData.get('currency')?.toString(),
      size: formData.get('size')?.toString() || undefined,
      $current_url: formData.get('$current_url')?.toString() ?? reqHeaders.get('referer') ?? undefined,
    });

    return { success: true, message: 'Added to cart' };
  } catch (error) {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({ headers: reqHeaders });
    const userId = session?.user?.id ?? 'anonymous';

    await captureServerError(error, {
      service: 'product',
      action: 'add_to_cart',
      userId,
      extra: {
        variantId: formData.get('variantId')?.toString(),
        productTitle: formData.get('productTitle')?.toString(),
      },
    });
    return { success: false, message: String(error) };
  }
}

export default addToCart;
