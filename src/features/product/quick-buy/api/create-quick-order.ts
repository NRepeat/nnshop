'use server';

import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';

type QuickOrderInput = {
  variantId: string;
  quantity: number;
  name: string;
  phone: string;
  productTitle: string;
  discountPercentage?: number;
};

type DraftOrder = {
  id: string;
  name: string;
  totalPrice: string;
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

export async function createQuickOrder(
  orderData: QuickOrderInput
): Promise<{
  success: boolean;
  orderId?: string;
  orderName?: string;
  errors?: string[];
}> {
  try {
    // Get session (optional for quick order)
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Split name into firstName and lastName
    const nameParts = orderData.name.trim().split(' ');
    const firstName = nameParts[0] || orderData.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Build line item with optional discount
    const lineItem: any = {
      variantId: orderData.variantId,
      quantity: orderData.quantity,
    };

    // Apply discount if exists
    if (orderData.discountPercentage && orderData.discountPercentage > 0) {
      lineItem.appliedDiscount = {
        valueType: 'PERCENTAGE',
        value: parseFloat(orderData.discountPercentage.toString()),
        description: `${orderData.discountPercentage}% discount`,
      };
    }

    // Build draft order input
    const input: any = {
      lineItems: [lineItem],
      note: `Быстрый заказ: ${orderData.productTitle}`,
      shippingAddress: {
        firstName: firstName,
        lastName: lastName,
        address1: 'Быстрый заказ',
        city: 'Не указан',
        country: 'UA',
        phone: orderData.phone,
        zip: '',
      },
      customAttributes: [
        {
          key: '_quick_order',
          value: 'true',
        },
        {
          key: '_customer_name',
          value: orderData.name,
        },
        {
          key: '_customer_phone',
          value: orderData.phone,
        },
      ],
    };

    // Log the input for debugging
    console.log('Quick Order - Creating draft order with input:', JSON.stringify(input, null, 2));

    // Create draft order in Shopify
    const orderResponse = await adminClient.client.request<
      {
        draftOrderCreate: {
          draftOrder: DraftOrder | null;
          userErrors: Array<{ field: string; message: string }>;
        };
      },
      {
        input: any;
      }
    >({
      query: DRAFT_ORDER_CREATE_MUTATION,
      variables: { input },
    });

    console.log('Quick Order - Shopify response:', JSON.stringify(orderResponse, null, 2));

    const { draftOrder, userErrors } = orderResponse.draftOrderCreate;

    if (userErrors.length > 0) {
      console.error('Quick Order - User Errors:', JSON.stringify(userErrors, null, 2));
      return {
        success: false,
        errors: userErrors.map((error) => error.message),
      };
    }

    if (!draftOrder) {
      console.error('Quick Order - No draft order returned');
      return {
        success: false,
        errors: ['Failed to create quick order'],
      };
    }

    // Save to database
    await prisma.order.create({
      data: {
        shopifyDraftOrderId: draftOrder.id,
        userId: userId || null,
        draft: true,
      },
    });

    return {
      success: true,
      orderId: draftOrder.id,
      orderName: draftOrder.name,
    };
  } catch (error) {
    console.error('Quick Order - Error:', error);
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to create quick order',
      ],
    };
  }
}
