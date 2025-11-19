'use server';
import { auth } from '@features/auth/lib/auth';
import { getCart } from '@features/cart/api/get';
import prisma from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';

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
  cartId: string,
): Promise<{ success: boolean; order?: any; errors?: string[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    const result = await getCart(cartId);
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
    const lineItems = cart.lines.edges.map((edge: any) => {
      const lineItem = edge.node;
      return {
        variantId: lineItem.merchandise.id,
        quantity: lineItem.quantity,
      };
    });
    console.log('cart?.buyerIdentity', cart);
    const customerInfo = cart?.buyerIdentity;

    const input: any = {
      lineItems: lineItems,
    };

    if (customerInfo && customerInfo?.email) {
      input.email = customerInfo.email;
    }
    if (customerInfo && customerInfo?.phone) {
      input.phone = customerInfo.phone;
    }

    const shippingAddress = customerInfo?.deliveryAddressPreferences?.[0];
    if (shippingAddress) {
      input.shippingAddress = {
        address1: shippingAddress.address1,
        city: shippingAddress.city,
        country: shippingAddress.country,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        zip: shippingAddress.zip,
      };
    }

    const orderResponse = await adminClient.client.request<{
      draftOrderCreate: {
        draftOrder: any | null;
        userErrors: Array<{ field: string; message: string }>;
      };
    }>({
      query: DRAFT_ORDER_CREATE_MUTATION,
      variables: { input },
    });

    console.log(
      ' ADMIN API DRAFT ORDER CREATE RESPONSE:',
      JSON.stringify(orderResponse, null, 2),
    );

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

    if (session && !session.user.isAnonymous) {
      await prisma.order.create({
        data: {
          shopifyOrderId: createdOrder.id,
          userId: session.user.id,
        },
      });
    }

    console.log(' REAL SHOPIFY DRAFT ORDER CREATED SUCCESSFULLY:', {
      id: createdOrder.id,
      name: createdOrder.name,
      totalPrice: createdOrder.totalPrice,
      lineItemsCount: createdOrder.lineItems?.edges?.length || 0,
    });

    return {
      success: true,
      order: createdOrder,
    };
  } catch (error) {
    console.error(' ERROR CREATING DRAFT ORDER WITH ADMIN API:', error);
    console.error(' ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cartId: cartId,
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
