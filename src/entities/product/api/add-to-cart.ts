'use server';

import { addToCartAction } from '@entities/cart/api/add-product';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { revalidateTag } from 'next/cache';

async function addToCart(_: any, formData: FormData) {
  try {
    const variantId = formData.get('variantId')?.toString();

    if (!variantId) {
      return { success: false, message: 'Missing variant ID' };
    }

    const result = await addToCartAction(variantId);

    if (!result.success) {
      return { success: false, message: result.error };
    }

    // @ts-ignore
    revalidateTag(CART_TAGS.CART);
    // @ts-ignore
    revalidateTag(CART_TAGS.CART_ITEMS);
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

export default addToCart;
