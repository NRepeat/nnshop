'use server';

import { addToCartAction } from '@entities/cart/api/add-product';
import { revalidatePath } from 'next/cache';

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

    revalidatePath('/products');
    return { success: true, message: 'Added to cart' };
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

export default addToCart;
