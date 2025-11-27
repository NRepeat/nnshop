'use server';
import { getCart } from '@entities/cart/api/get';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
type DrafOrder = {
  id: string;
  name: string;
  totalPrice: number;
  lineItems: {
    edges: {
      node: {
        id: string;
        title: string;
        quantity: number;
      };
    }[];
  };
};
const DRAFT_ORDER_CREATE_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        totalPrice
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createDraftOrder(
  completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null,
): Promise<{
  success: boolean;
  order?: DrafOrder;
  errors?: string[];
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.error('SESSION NOT FOUND');
      return {
        success: false,
        errors: ['Session not found'],
      };
    }
    const cartId = await prisma.cart.findFirst({
      where: { userId: session.user.id, completed: false },
    });
    const result = await getCart(cartId?.cartToken);
    if (!result) {
      console.error('CART NOT FOUND');
      return {
        success: false,
        errors: ['Cart  NOT FOUND'],
      };
    }
    const cart = result.cart;
    if (!cart) {
      console.error('CART NOT FOUND');
      return {
        success: false,
        errors: ['Cart  NOT FOUND'],
      };
    }
    if (!cart.lines || !cart.lines.edges.length) {
      console.error('CART HAS NO ITEMS');
      return {
        success: false,
        errors: ['Cart has no items'],
      };
    }
    const lineItems = cart.lines.edges
      .map((edge: any) => {
        const lineItem = edge.node;
        if (lineItem.quantity === 0) {
          return null;
        }
        return {
          variantId: lineItem.merchandise.id,
          quantity: lineItem.quantity,
        };
      })
      .filter((item) => item !== null);
    const input: any = {
      lineItems: lineItems,
    };
    if (!completeCheckoutData) {
      throw new Error('Checkout data is missing');
    }
    if (completeCheckoutData.contactInfo.email) {
      input.email = completeCheckoutData.contactInfo.email;
    }
    if (completeCheckoutData.contactInfo.phone) {
      input.phone = completeCheckoutData.contactInfo.phone;
    }
    const selectedDelivery = cart.delivery.addresses.find(
      (a) => a.selected,
    )?.address;
    const shippingAddress = {
      address1: selectedDelivery?.address1 || '',
      city: selectedDelivery?.city || '',
      country: selectedDelivery?.countryCode || '',
      firstName: completeCheckoutData.contactInfo.name || '',
      lastName: completeCheckoutData.contactInfo.lastName || '',
      phone: completeCheckoutData.contactInfo.phone || '',
      zip: selectedDelivery?.zip || '',
      address2: selectedDelivery?.address2 || undefined,
    };
    input.shippingAddress = shippingAddress;

    const orderResponse = await adminClient.client.request<{
      draftOrderCreate: {
        draftOrder: DrafOrder | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: DRAFT_ORDER_CREATE_MUTATION,
      variables: { input },
    });

    if (orderResponse.draftOrderCreate.userErrors.length > 0) {
      console.error(
        ' ADMIN API USER ERRORS:',
        orderResponse.draftOrderCreate.userErrors,
      );
      return {
        success: false,
        errors: orderResponse.draftOrderCreate.userErrors.map(
          (error) => error.message,
        ),
      };
    }

    if (!orderResponse.draftOrderCreate.draftOrder) {
      console.error(' NO DRAFT ORDER RETURNED FROM ADMIN API');
      return {
        success: false,
        errors: ['Failed to create draft order - no order returned'],
      };
    }

    const createdOrder = orderResponse.draftOrderCreate.draftOrder;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) {
      await prisma.order.create({
        data: {
          shopifyDraftOrderId: createdOrder.id,
          userId: session.user.id,
          draft: true,
        },
      });
    }
    return {
      success: true,
      order: createdOrder,
    };
  } catch (error) {
    console.error(' ERROR CREATING DRAFT ORDER WITH ADMIN API:', error);
    console.error(' ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cartId: '',
    });
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to create draft order with Admin API',
      ],
    };
  }
}
