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
  price: string;
  currencyCode: string;
};

type OrderResult = {
  id: string;
  name: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
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

const ORDER_CREATE_MUTATION = `
  mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order {
        id
        name
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
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

export async function createQuickOrder(orderData: QuickOrderInput): Promise<{
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

    // Calculate price with optional discount
    const originalPrice = parseFloat(orderData.price);
    let finalPrice = originalPrice;
    if (orderData.discountPercentage && orderData.discountPercentage > 0) {
      finalPrice = originalPrice * (1 - orderData.discountPercentage / 100);
    }

    const lineItem: any = {
      variantId: orderData.variantId,
      quantity: orderData.quantity,
      priceSet: {
        shopMoney: {
          amount: finalPrice.toFixed(2),
          currencyCode: orderData.currencyCode,
        },
      },
    };

    // Build order input
    const order: any = {
      lineItems: [lineItem],
      currency: orderData.currencyCode,
      financialStatus: 'PENDING',
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
    console.log(
      'Quick Order - Creating order with input:',
      JSON.stringify(order, null, 2),
    );

    // Create order in Shopify
    const orderResponse = await adminClient.client.request<
      {
        orderCreate: {
          order: OrderResult | null;
          userErrors: Array<{ field: string; message: string }>;
        };
      },
      {
        order: any;
        options: { sendReceipt: boolean };
      }
    >({
      query: ORDER_CREATE_MUTATION,
      variables: {
        order,
        options: { sendReceipt: false },
      },
    });

    console.log(
      'Quick Order - Shopify response:',
      JSON.stringify(orderResponse, null, 2),
    );

    const { order: createdOrder, userErrors } = orderResponse.orderCreate;

    if (userErrors.length > 0) {
      console.error(
        'Quick Order - User Errors:',
        JSON.stringify(userErrors, null, 2),
      );
      return {
        success: false,
        errors: userErrors.map((error) => error.message),
      };
    }

    if (!createdOrder) {
      console.error('Quick Order - No order returned');
      return {
        success: false,
        errors: ['Failed to create quick order'],
      };
    }
    if (userId) {
      await prisma.order.create({
        data: {
          shopifyOrderId: createdOrder.id,
          userId: userId,
          draft: false,
        },
      });
    }

    return {
      success: true,
      orderId: createdOrder.id,
      orderName: createdOrder.name,
    };
  } catch (error) {
    console.error('Quick Order - Error:', error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : 'Failed to create quick order',
      ],
    };
  }
}
