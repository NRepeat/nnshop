'use server';
import { cookies, headers } from 'next/headers';
import {
  ContactInfo,
  contactInfoSchema,
  formatPhoneForShopify,
} from '../schema/contactInfoSchema';
import { auth } from '@features/auth/lib/auth';
import prisma from '@shared/lib/prisma';
import { updateCartBuyerIdentity } from '@entities/cart/api/shopify-cart-buyer-identity-update';

export async function saveContactInfo(
  data: ContactInfo,
): Promise<{ success: boolean; message: string }> {
  try {
    const validationResult = contactInfoSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please fix the validation errors.',
      };
    }

    const contactInfo = validationResult.data;

    const cookieStore = await cookies();
    const contactInfoJson = JSON.stringify(contactInfo);

    cookieStore.set('contactInfo', contactInfoJson, {
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session) {
        throw new Error('Session not found');
      }
      const sessionCart = await prisma.cart.findUnique({
        where: {
          userId: session.user.id,
        },
      });
      if (sessionCart) {
        const formattedPhone = formatPhoneForShopify(
          contactInfo.phone,
          contactInfo.countryCode,
        );
        const cartUpdateResult = await updateCartBuyerIdentity(
          sessionCart.cartToken,
          {
            email: contactInfo.email,
            phone: formattedPhone,
            countryCode: contactInfo.countryCode,
          },
        );
        console.log('cartUpdateResult', cartUpdateResult);
        if (!cartUpdateResult.success) {
          console.warn(
            'Failed to update cart buyer identity:',
            cartUpdateResult.errors,
          );
        }
      }
    } catch (cartError) {
      console.warn('Error updating cart buyer identity:', cartError);
    }

    return {
      success: true,
      message: 'Contact information saved successfully!',
    };
  } catch (error) {
    console.error('Error saving contact info:', error);
    return {
      success: false,
      message:
        'An error occurred while saving your contact information. Please try again.',
    };
  }
}
