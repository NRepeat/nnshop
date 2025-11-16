// app/actions.ts (or outside your component)
'use server';

import { addToCartAction } from '@features/cart/api/add-product';
import { revalidatePath } from 'next/cache';

// This is just an example function.
// You would replace this with your actual "add to cart" logic
// (e.g., creating/updating a cart in your database or Shopify).
async function addToCart(formData: FormData) {
  try {
    console.log('addToCart', formData);
    const variantId = formData.get('variantId')?.toString();

    if (!variantId) {
      throw new Error('Missing variant ID');
    }
    console.log(`Adding variant ${variantId} to cart.`);
    const result = await addToCartAction(variantId);
    if (!result.success) {
      throw new Error('Product not added :' + result.error);
    }
    // Your logic here:
    // 1. Get the current cart (from cookies, session, or DB)
    // 2. Add the variantId to the cart
    // 3. Save the cart

    // Revalidate the page path to show updated cart info (e.g., in the header)
    revalidatePath('/products'); // Or whatever path your product page is on
  } catch (error) {
    throw new Error(String(error));
  }
}

export default addToCart;
