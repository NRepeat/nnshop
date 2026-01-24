'use server';

import { addToCartAction } from '@entities/cart/api/add-product';
import { CART_TAGS } from '@shared/lib/cached-fetch';
import { revalidateTag } from 'next/cache';
import { checkInventoryLevel } from './check-inventory-level';

async function addToCart(_: any, formData: FormData) {
  try {
    const variantId = formData.get('variantId')?.toString();

    if (!variantId) {
      return { success: false, message: 'Missing variant ID' };
    }
    const itemQuantity = await checkInventoryLevel(variantId);
    if (itemQuantity?.quantity === 0) {
      return { error: 'No products avalible' };
    }
    const result = await addToCartAction(variantId);

    if (!result.success) {
      return { success: false, message: result.error };
    }

    revalidateTag(CART_TAGS.CART, { expire: 0 });
    revalidateTag(CART_TAGS.CART_ITEMS, { expire: 0 });
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

export default addToCart;
