'use server';

import { addToCartAction } from '@entities/cart/api/add-product';
import { checkInventoryLevel } from './check-inventory-level';
import { revalidateTag } from 'next/cache';

async function addToCart(_: any, formData: FormData) {
  try {
    const variantId = formData.get('variantId')?.toString();

    if (!variantId) {
      return { success: false, message: 'Missing variant ID' };
    }
    const itemQuantity = await checkInventoryLevel(variantId);
    if (!itemQuantity || itemQuantity.quantity === 0) {
      return { success: false, message: 'No products available' };
    }
    const result = await addToCartAction(variantId);
    revalidateTag('cart', { expire: 0 });

    if (!result.success) {
      return { success: false, message: result.error };
    }
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

export default addToCart;
