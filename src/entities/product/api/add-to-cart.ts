// app/actions.ts (or outside your component)
'use server';

import { addToCartAction } from '@features/cart/api/add-product';
import { revalidatePath } from 'next/cache';

// This is just an example function.
// You would replace this with your actual "add to cart" logic
// (e.g., creating/updating a cart in your database or Shopify).
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
